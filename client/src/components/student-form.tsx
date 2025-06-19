import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { submitExampleSchema, type SubmitExample, type Submission } from "@shared/schema";

interface StudentFormProps {
  lessonId: number;
  lesson: { lawNumber: number; title: string };
  onSubmissionComplete: (submission: Submission) => void;
}

export default function StudentForm({ lessonId, lesson, onSubmissionComplete }: StudentFormProps) {
  // Safety check in case lesson is undefined
  if (!lesson) {
    return <div>Loading...</div>;
  }
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDraft, setIsDraft] = useState(false);

  const form = useForm<SubmitExample>({
    resolver: zodResolver(submitExampleSchema),
    defaultValues: {
      lessonId,
      title: "",
      actionForce: "",
      reactionForce: "",
      explanation: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: SubmitExample) => {
      const response = await apiRequest("POST", "/api/submissions", data);
      return response.json();
    },
    onSuccess: (submission: Submission) => {
      toast({
        title: "Submission graded!",
        description: `You scored ${submission.score}/10 on your example.`,
      });
      
      form.reset();
      onSubmissionComplete(submission);
      
      // Invalidate lessons cache to update completion status
      queryClient.invalidateQueries({ queryKey: ["/api/lessons"] });
      queryClient.invalidateQueries({ queryKey: [`/api/lessons/${lessonId}`] });
    },
    onError: (error: any) => {
      toast({
        title: "Submission failed",
        description: error.message || "There was an error processing your submission.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SubmitExample) => {
    submitMutation.mutate(data);
  };

  const saveDraft = () => {
    setIsDraft(true);
    toast({
      title: "Draft saved",
      description: "Your example has been saved as a draft.",
    });
  };

  return (
    <Card className="bg-white rounded-xl shadow-md border border-gray-200">
      <CardContent className="p-8">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-2xl font-heading font-bold mb-2">
            Your Turn: Provide Your Own Example
          </h3>
          <p className="text-gray-600 mb-6">
            {lesson.lawNumber === 1 && "Think of a real-world situation that demonstrates Newton's First Law (inertia). Describe what happens when forces are or aren't applied."}
            {lesson.lawNumber === 2 && "Think of a real-world situation that demonstrates Newton's Second Law (F = ma). Describe how force, mass, and acceleration relate."}
            {lesson.lawNumber === 3 && "Think of a real-world situation that demonstrates Newton's Third Law. Describe both the action and reaction forces."}
          </p>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Example Title
              </Label>
              <Input
                id="title"
                placeholder="e.g., Shooting a Basketball"
                {...form.register("title")}
                className="w-full"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="actionForce" className="block text-sm font-medium text-gray-700 mb-2">
                {lesson.lawNumber === 1 && "Describe the Object and Its Initial State"}
                {lesson.lawNumber === 2 && "Describe the Force Being Applied"}
                {lesson.lawNumber === 3 && "Describe the Action Force"}
              </Label>
              <Textarea
                id="actionForce"
                rows={3}
                placeholder={
                  lesson.lawNumber === 1 
                    ? "What object are you describing? Is it at rest or in motion?"
                    : lesson.lawNumber === 2 
                    ? "What force is being applied and in which direction?"
                    : "What force is being applied and in which direction?"
                }
                {...form.register("actionForce")}
                className="w-full"
              />
              {form.formState.errors.actionForce && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.actionForce.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="reactionForce" className="block text-sm font-medium text-gray-700 mb-2">
                {lesson.lawNumber === 1 && "Describe What Happens Next"}
                {lesson.lawNumber === 2 && "Describe the Resulting Motion"}
                {lesson.lawNumber === 3 && "Describe the Reaction Force"}
              </Label>
              <Textarea
                id="reactionForce"
                rows={3}
                placeholder={
                  lesson.lawNumber === 1 
                    ? "What happens when a force is applied or removed? How does the object respond?"
                    : lesson.lawNumber === 2 
                    ? "How does the object accelerate? What affects the acceleration?"
                    : "What is the equal and opposite reaction force?"
                }
                {...form.register("reactionForce")}
                className="w-full"
              />
              {form.formState.errors.reactionForce && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.reactionForce.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="explanation" className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Explanation
              </Label>
              <Textarea
                id="explanation"
                rows={4}
                placeholder={
                  lesson.lawNumber === 1 
                    ? "Explain how this example demonstrates Newton's First Law (inertia)..."
                    : lesson.lawNumber === 2 
                    ? "Explain how this example demonstrates Newton's Second Law (F = ma)..."
                    : "Explain how this example demonstrates Newton's Third Law..."
                }
                {...form.register("explanation")}
                className="w-full"
              />
              {form.formState.errors.explanation && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.explanation.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-4">
              <Button 
                type="button"
                variant="outline"
                onClick={saveDraft}
                disabled={submitMutation.isPending}
              >
                Save Draft
              </Button>
              
              <Button 
                type="submit"
                disabled={submitMutation.isPending}
                className="px-8"
              >
                {submitMutation.isPending ? "Submitting..." : "Submit for AI Grading"}
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
