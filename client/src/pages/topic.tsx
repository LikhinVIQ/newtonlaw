import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/navigation";
import ProgressStepper from "@/components/progress-stepper";
import type { Topic, Lesson } from "@shared/schema";

export default function TopicPage() {
  const { slug } = useParams();
  
  const { data: topic, isLoading: topicLoading } = useQuery<Topic>({
    queryKey: [`/api/topics/${slug}`]
  });

  const { data: lessons = [], isLoading: lessonsLoading } = useQuery<Lesson[]>({
    queryKey: [`/api/topics/${slug}/lessons`],
    enabled: !!slug
  });

  const isLoading = topicLoading || lessonsLoading;

  if (isLoading) {
    return (
      <div className="bg-neutral min-h-screen font-body text-dark">
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading topic...</div>
        </main>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="bg-neutral min-h-screen font-body text-dark">
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Topic Not Found</h1>
            <Link href="/">
              <Button>Back to Topics</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const completedCount = lessons.filter(lesson => lesson.completed).length;
  const totalCount = lessons.length;

  return (
    <div className="bg-neutral min-h-screen font-body text-dark">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Topic Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <span className="text-5xl">{topic.icon}</span>
            <h1 className="text-4xl font-heading font-bold text-dark">
              {topic.name}
            </h1>
          </div>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            {topic.description}
          </p>
          
          <div className="flex items-center justify-center space-x-4">
            <Badge variant="outline" className="text-sm">
              {totalCount} Lessons
            </Badge>
            <Badge variant="secondary" className="text-sm">
              Progress: {completedCount}/{totalCount}
            </Badge>
          </div>
        </div>

        {/* Progress Stepper */}
        {lessons.length > 0 && (
          <div className="mb-8">
            <ProgressStepper lessons={lessons} />
          </div>
        )}

        {/* Lessons Grid */}
        <div className="grid gap-6">
          {lessons.map((lesson) => (
            <Card key={lesson.id} className="bg-white rounded-xl shadow-md border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <Badge variant="outline" className="text-xs">
                        Lesson {lesson.lessonNumber}
                      </Badge>
                      {lesson.completed && (
                        <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                          ✓ Completed
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-heading font-semibold text-dark mb-2">
                      {lesson.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {lesson.theory.substring(0, 150)}...
                    </p>
                    
                    <div className="text-sm text-gray-500">
                      {lesson.examples.length} examples included
                    </div>
                  </div>
                  
                  <div className="ml-6">
                    <Link href={`/lesson/${lesson.id}`}>
                      <Button>
                        {lesson.completed ? "Review" : "Start"}
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {lessons.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No lessons available</h3>
            <p className="text-gray-600">Lessons for this topic are coming soon.</p>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-12 text-center">
          <Link href="/">
            <Button variant="outline">
              ← Back to All Topics
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}