import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import LessonContent from "@/components/lesson-content";
import StudentForm from "@/components/student-form";
import FeedbackDisplay from "@/components/feedback-display";
import LoadingModal from "@/components/loading-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { Lesson, Submission } from "@shared/schema";

export default function LessonPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("examples");
  const [currentSubmission, setCurrentSubmission] = useState<Submission | null>(null);
  const [showLoadingModal, setShowLoadingModal] = useState(false);

  const lessonId = parseInt(id || "0");
  
  const { data: lesson, isLoading, error } = useQuery<Lesson>({
    queryKey: [`/api/lessons/${lessonId}`],
    enabled: !!lessonId
  });

  const handleSubmissionComplete = (submission: Submission) => {
    setCurrentSubmission(submission);
    setShowLoadingModal(false);
  };

  const handleTryAnother = () => {
    setCurrentSubmission(null);
    setActiveTab("practice");
  };

  const handleContinue = () => {
    // Navigate to next lesson or back to home
    if (lesson && lesson.lawNumber < 3) {
      // Find next lesson
      const nextLessonId = lesson.id + 1;
      setLocation(`/lesson/${nextLessonId}`);
    } else {
      setLocation("/");
    }
  };

  if (isLoading) {
    return (
      <div className="bg-neutral min-h-screen">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-32 w-full rounded-xl mb-8" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </main>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="bg-neutral min-h-screen">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert className="max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error ? "Failed to load lesson" : "Lesson not found"}
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-neutral min-h-screen font-body text-dark">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LessonContent 
          lesson={lesson} 
          onTabChange={setActiveTab}
        />
        
        {activeTab === "practice" && !currentSubmission && (
          <StudentForm 
            lessonId={lessonId}
            onSubmissionComplete={handleSubmissionComplete}
          />
        )}
        
        {currentSubmission && (
          <FeedbackDisplay
            submission={currentSubmission}
            onTryAnother={handleTryAnother}
            onContinue={handleContinue}
          />
        )}
        
        <LoadingModal open={showLoadingModal} />
      </main>
    </div>
  );
}
