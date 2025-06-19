import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Lesson } from "@shared/schema";

export default function Navigation() {
  const [location] = useLocation();
  const { data: lessons = [] } = useQuery<Lesson[]>({
    queryKey: ["/api/lessons"]
  });

  const completedCount = lessons.filter(lesson => lesson.completed).length;
  const totalCount = lessons.length;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <Link href="/">
                <h1 className="text-2xl font-heading font-bold text-primary cursor-pointer">
                  Newton's Laws
                </h1>
              </Link>
            </div>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <Link href="/">
              <span className={`px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                location === "/" 
                  ? "text-gray-900 hover:text-primary" 
                  : "text-gray-600 hover:text-primary"
              }`}>
                Overview
              </span>
            </Link>
            {lessons.map((lesson) => (
              <Link key={lesson.id} href={`/lesson/${lesson.id}`}>
                <span className={`px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                  location === `/lesson/${lesson.id}` 
                    ? "text-gray-900 hover:text-primary" 
                    : "text-gray-600 hover:text-primary"
                }`}>
                  {lesson.lawNumber === 1 && "First Law"}
                  {lesson.lawNumber === 2 && "Second Law"}
                  {lesson.lawNumber === 3 && "Third Law"}
                </span>
              </Link>
            ))}
          </nav>
          
          <div className="flex items-center space-x-4">
            <div className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm font-medium">
              Progress: {completedCount}/{totalCount}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
