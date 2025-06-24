import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import ProgressStepper from "@/components/progress-stepper";
import LawCard from "@/components/law-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Lesson } from "@shared/schema";
import Simulation from "@/components/simulationm";
import Simulation2 from "@/components/simulation2";
import SimulationF from "@/components/simulationf";

export default function Home() {
  const { data: lessons = [], isLoading } = useQuery<Lesson[]>({
    queryKey: ["/api/lessons"],
  });

  if (isLoading) {
    return (
      <div className="bg-neutral min-h-screen">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-12">
            <Skeleton className="h-12 w-96 mx-auto mb-4" />
            <Skeleton className="h-6 w-[600px] mx-auto mb-8" />
            <div className="flex justify-center items-center space-x-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <Skeleton className="ml-2 h-4 w-16" />
                  {i < 3 && <Skeleton className="w-12 h-1 ml-4" />}
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-neutral min-h-screen font-body text-dark">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h2 className="text-4xl font-heading font-bold text-dark mb-4">
            Master Newton's Three Laws of Motion
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Interactive lessons combining theory with real-world examples, plus
            AI-powered assessment of your understanding.
          </p>

          <ProgressStepper lessons={lessons} />
        </section>

        {/* Laws Grid */}
        <section className="grid md:grid-cols-3 gap-8 mb-12">
          {lessons
            .sort((a, b) => a.lawNumber - b.lawNumber)
            .map((lesson) => (
              <LawCard key={lesson.id} lesson={lesson} />
            ))}
        </section>

        {/* Simulation */}
        <section>
          <Simulation2 />
          <Simulation />
          <SimulationF />
        </section>
      </main>
    </div>
  );
}
