import type { Lesson } from "@shared/schema";

interface ProgressStepperProps {
  lessons: Lesson[];
}

export default function ProgressStepper({ lessons }: ProgressStepperProps) {
  const sortedLessons = lessons.sort((a, b) => a.lawNumber - b.lawNumber);
  
  return (
    <div className="flex justify-center items-center space-x-4 mb-8">
      {sortedLessons.map((lesson, index) => (
        <div key={lesson.id} className="flex items-center">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
              lesson.completed 
                ? "bg-secondary text-white" 
                : "bg-gray-300 text-gray-500"
            }`}>
              {lesson.lawNumber}
            </div>
            <span className={`ml-2 text-sm font-medium ${
              lesson.completed ? "text-secondary" : "text-gray-500"
            }`}>
              {lesson.lawNumber === 1 && "First Law"}
              {lesson.lawNumber === 2 && "Second Law"}
              {lesson.lawNumber === 3 && "Third Law"}
            </span>
          </div>
          
          {index < sortedLessons.length - 1 && (
            <div className={`w-12 h-1 ml-4 rounded ${
              lesson.completed ? "bg-secondary" : "bg-gray-300"
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}
