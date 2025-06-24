import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Lesson } from "@shared/schema";
import type { QuizQuestion } from "@shared/quiz-types";
import { EXAMPLE_IMAGES } from "@/lib/constants";
import QuizComponent from "./quiz-component";

interface LessonContentProps {
  lesson: Lesson;
  onTabChange?: (tab: string) => void;
}

export default function LessonContent({ lesson, onTabChange }: LessonContentProps) {
  const [activeTab, setActiveTab] = useState("examples");
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };
  
  const exampleImage = EXAMPLE_IMAGES[lesson.lawNumber as keyof typeof EXAMPLE_IMAGES];
  const examples = Array.isArray(lesson.examples) ? lesson.examples : [];
  const quizQuestions = Array.isArray(lesson.quizQuestions) ? lesson.quizQuestions as QuizQuestion[] : [];
  
  return (
    <section className="bg-white rounded-xl shadow-md border border-gray-200 p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-heading font-bold text-dark">{lesson.title}</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Lesson {lesson.lawNumber} of 3</span>
          <div className="w-24 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full" 
              style={{ width: `${(lesson.lawNumber / 3) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="theory">Theory</TabsTrigger>
          <TabsTrigger value="examples">Real-World Examples</TabsTrigger>
          <TabsTrigger value="quiz">Quiz</TabsTrigger>
          <TabsTrigger value="practice">Your Example</TabsTrigger>
        </TabsList>

        <TabsContent value="theory" className="mt-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-heading font-semibold mb-4">
                Understanding {lesson.title}
              </h3>
              <p className="text-gray-700 mb-4">{lesson.theory}</p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Key Points:</h4>
                <ul className="text-blue-800 space-y-1 text-sm">
                  {lesson.lawNumber === 1 && (
                    <>
                      <li>• Objects resist changes in motion (inertia)</li>
                      <li>• External forces are needed to change motion</li>
                      <li>• Mass affects how much an object resists change</li>
                    </>
                  )}
                  {lesson.lawNumber === 2 && (
                    <>
                      <li>• Force is proportional to acceleration</li>
                      <li>• Mass is inversely proportional to acceleration</li>
                      <li>• F = ma is the mathematical relationship</li>
                    </>
                  )}
                  {lesson.lawNumber === 3 && (
                    <>
                      <li>• Forces occur in action-reaction pairs</li>
                      <li>• The forces are equal in magnitude</li>
                      <li>• The forces are opposite in direction</li>
                      <li>• The forces act on different objects</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
            
            <div>
              <img 
                src={exampleImage} 
                alt={`Visual representation of ${lesson.title}`}
                className="rounded-xl shadow-lg w-full h-64 object-cover mb-4" 
              />
              <p className="text-sm text-gray-600 text-center">
                {lesson.lawNumber === 1 && "Objects in motion tend to stay in motion"}
                {lesson.lawNumber === 2 && "Greater force produces greater acceleration"}
                {lesson.lawNumber === 3 && "Action and reaction forces work together"}
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="examples" className="mt-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-heading font-semibold mb-4">
                Understanding {lesson.title}
              </h3>
              <p className="text-gray-700 mb-4">{lesson.theory}</p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Key Points:</h4>
                <ul className="text-blue-800 space-y-1 text-sm">
                  {lesson.lawNumber === 1 && (
                    <>
                      <li>• Objects resist changes in motion (inertia)</li>
                      <li>• External forces are needed to change motion</li>
                      <li>• Mass affects how much an object resists change</li>
                    </>
                  )}
                  {lesson.lawNumber === 2 && (
                    <>
                      <li>• Force is proportional to acceleration</li>
                      <li>• Mass is inversely proportional to acceleration</li>
                      <li>• F = ma is the mathematical relationship</li>
                    </>
                  )}
                  {lesson.lawNumber === 3 && (
                    <>
                      <li>• Forces occur in action-reaction pairs</li>
                      <li>• The forces are equal in magnitude</li>
                      <li>• The forces are opposite in direction</li>
                      <li>• The forces act on different objects</li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            <div>
              <img 
                src={exampleImage} 
                alt={`${lesson.title} demonstration`}
                className="rounded-xl shadow-lg w-full h-64 object-cover mb-4" 
              />
              <p className="text-sm text-gray-600 text-center">
                {lesson.lawNumber === 1 && "Car crash: Passengers continue moving forward due to inertia"}
                {lesson.lawNumber === 2 && "Pushing objects: More force creates more acceleration"}
                {lesson.lawNumber === 3 && "Rocket propulsion: Hot gases expelled downward push rocket upward"}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-heading font-semibold mb-4">Real-World Examples</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {examples.map((example: any, index: number) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mb-3">
                    <span className="text-accent text-xl">
                      {lesson.lawNumber === 1 && ["🚗", "🏒", "🍽️"][index]}
                      {lesson.lawNumber === 2 && ["🛒", "⚾", "🚗"][index]}
                      {lesson.lawNumber === 3 && ["🚀", "🚶", "🏊"][index]}
                    </span>
                  </div>
                  <h4 className="font-semibold mb-2">{example.title}</h4>
                  <p className="text-sm text-gray-600">{example.description}</p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="quiz" className="mt-6">
          {quizQuestions.length > 0 ? (
            <QuizComponent
              questions={quizQuestions}
              lessonTitle={lesson.title}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Quiz questions are being prepared for this lesson.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="practice" className="mt-6">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Switch to the practice tab to submit your own example.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
