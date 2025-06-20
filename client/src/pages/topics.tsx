import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/navigation";
import type { Topic } from "@shared/schema";

export default function Topics() {
  const { data: topics = [], isLoading } = useQuery<Topic[]>({
    queryKey: ["/api/topics"]
  });

  if (isLoading) {
    return (
      <div className="bg-neutral min-h-screen font-body text-dark">
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading topics...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-neutral min-h-screen font-body text-dark">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-heading font-bold text-dark mb-4">
            Physics Learning Hub
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore different areas of physics through interactive lessons, 
            real-world examples, and AI-powered assessment.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {topics.map((topic) => (
            <Link key={topic.id} href={`/topics/${topic.slug}`}>
              <Card className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-8">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="text-4xl">{topic.icon}</div>
                    <div>
                      <h3 className="text-xl font-heading font-semibold text-dark">
                        {topic.name}
                      </h3>
                      <Badge variant="secondary" className="mt-1">
                        Interactive Lessons
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {topic.description}
                  </p>
                  
                  <div className="mt-6 flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Click to explore
                    </span>
                    <div className="text-primary font-medium">
                      Start Learning →
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Features Section */}
        <div className="mt-16 bg-white rounded-xl shadow-md border border-gray-200 p-8">
          <h2 className="text-2xl font-heading font-bold text-center mb-8">
            Learning Features
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="font-semibold mb-2">Interactive Theory</h3>
              <p className="text-sm text-gray-600">
                Learn concepts with clear explanations and visual aids
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">🌍</span>
              </div>
              <h3 className="font-semibold mb-2">Real Examples</h3>
              <p className="text-sm text-gray-600">
                See physics in action with practical everyday examples
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="font-semibold mb-2">AI Assessment</h3>
              <p className="text-sm text-gray-600">
                Get personalized feedback on your understanding
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}