import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import type { Lesson } from "@shared/schema";
import { NEWTON_LAWS } from "@/lib/constants";

interface LawCardProps {
  lesson: Lesson;
}

export default function LawCard({ lesson }: LawCardProps) {
  const lawInfo = NEWTON_LAWS[lesson.lawNumber as keyof typeof NEWTON_LAWS];

  // Handle case where lawInfo is undefined
  if (!lawInfo) {
    console.warn(`No law info found for lawNumber: ${lesson.lawNumber}`);
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">❓</span>
          </div>

          <h3 className="text-xl font-heading font-semibold mb-2">
            Unknown Law
          </h3>

          <p className="text-gray-600 mb-4">
            Law information not found for law number: {lesson.lawNumber}
          </p>

          <div className="flex items-center justify-between">
            <Badge variant={lesson.completed ? "default" : "secondary"}>
              {lesson.completed ? "Completed" : "Not Started"}
            </Badge>
            <span className="text-sm text-gray-500">Duration unknown</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link href={`/lesson/${lesson.id}`}>
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <div className="p-6">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">{lawInfo.icon}</span>
          </div>

          <h3 className="text-xl font-heading font-semibold mb-2">
            {lawInfo.title}
          </h3>

          <p className="text-gray-600 mb-4">
            {lawInfo.subtitle} - {lawInfo.description}
          </p>

          <div className="flex items-center justify-between">
            <Badge variant={lesson.completed ? "default" : "secondary"}>
              {lesson.completed ? "Completed" : "Not Started"}
            </Badge>
            <span className="text-sm text-gray-500">{lawInfo.duration}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
