import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import type { Topic } from "@shared/schema";

export default function Navigation() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { data: topics = [] } = useQuery<Topic[]>({
    queryKey: ["/api/topics"]
  });



  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout", {});
      window.location.reload();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

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
          
          <nav className="hidden md:flex space-x-1">
            {topics.map((topic) => (
              <Link 
                key={topic.id} 
                href={`/topics/${topic.slug}`}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location === `/topics/${topic.slug}` || location.startsWith(`/topics/${topic.slug}`)
                    ? 'bg-primary/10 text-primary' 
                    : 'text-gray-600 hover:text-primary hover:bg-primary/5'
                }`}
              >
                <span className="mr-1">{topic.icon}</span>
                {topic.name.split(' ').slice(0, 2).join(' ')}
              </Link>
            ))}
          </nav>
          
          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">
                  Welcome, {user.firstName || user.email}
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
