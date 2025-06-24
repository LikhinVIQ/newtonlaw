import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, RotateCcw } from "lucide-react";
import type { QuizQuestion, QuizResult, QuizScore } from "@shared/quiz-types";

interface QuizComponentProps {
  questions: QuizQuestion[];
  lessonTitle: string;
}

export default function QuizComponent({ questions, lessonTitle }: QuizComponentProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      completeQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const completeQuiz = () => {
    setQuizCompleted(true);
    setShowResults(true);
  };

  const calculateScore = (): QuizScore => {
    const results: QuizResult[] = questions.map(question => ({
      questionId: question.id,
      selectedAnswer: selectedAnswers[question.id - 1] ?? -1,
      correct: selectedAnswers[question.id - 1] === question.correctAnswer
    }));

    const correct = results.filter(r => r.correct).length;
    const total = questions.length;
    
    return {
      correct,
      total,
      percentage: Math.round((correct / total) * 100)
    };
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
    setQuizCompleted(false);
  };

  const score = calculateScore();
  const currentQ = questions[currentQuestion];
  const isAnswered = selectedAnswers[currentQuestion] !== undefined;

  if (showResults) {
    return (
      <div className="space-y-6">
        <Card className="border-2">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              Quiz Results: {lessonTitle}
            </CardTitle>
            <div className="text-4xl font-bold mt-4">
              <span className={score.percentage >= 70 ? "text-green-600" : "text-orange-600"}>
                {score.correct}/{score.total}
              </span>
            </div>
            <p className="text-lg text-gray-600">
              {score.percentage}% Correct
            </p>
            {score.percentage >= 70 ? (
              <p className="text-green-600 font-semibold">Great job! You understand this law well.</p>
            ) : (
              <p className="text-orange-600 font-semibold">Review the theory and try again to improve your understanding.</p>
            )}
          </CardHeader>
        </Card>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Review Your Answers</h3>
          {questions.map((question, index) => {
            const userAnswer = selectedAnswers[index];
            const isCorrect = userAnswer === question.correctAnswer;
            
            return (
              <Card key={question.id} className={`border-2 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 mb-4">
                    {isCorrect ? (
                      <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold mb-3">{question.question}</p>
                      
                      <div className="space-y-2 mb-4">
                        {question.options.map((option, optionIndex) => {
                          const isUserChoice = userAnswer === optionIndex;
                          const isCorrectChoice = optionIndex === question.correctAnswer;
                          
                          let className = "p-3 rounded-lg border ";
                          if (isCorrectChoice) {
                            className += "bg-green-100 border-green-300 text-green-800";
                          } else if (isUserChoice && !isCorrectChoice) {
                            className += "bg-red-100 border-red-300 text-red-800";
                          } else {
                            className += "bg-gray-50 border-gray-200";
                          }
                          
                          return (
                            <div key={optionIndex} className={className}>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{String.fromCharCode(65 + optionIndex)})</span>
                                <span>{option}</span>
                                {isCorrectChoice && <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />}
                                {isUserChoice && !isCorrectChoice && <XCircle className="w-4 h-4 text-red-600 ml-auto" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                          <strong>Explanation:</strong> {question.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-center">
          <Button onClick={resetQuiz} className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Take Quiz Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">
              Question {currentQuestion + 1} of {questions.length}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            <h3 className="text-lg font-semibold leading-relaxed">
              {currentQ.question}
            </h3>
            
            <RadioGroup
              value={selectedAnswers[currentQuestion]?.toString() || ""}
              onValueChange={(value) => handleAnswerSelect(currentQuestion, parseInt(value))}
            >
              {currentQ.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label 
                    htmlFor={`option-${index}`} 
                    className="flex-1 text-base cursor-pointer"
                  >
                    <span className="font-semibold mr-2">{String.fromCharCode(65 + index)})</span>
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>
        
        <Button 
          onClick={handleNext}
          disabled={!isAnswered}
          className="min-w-24"
        >
          {currentQuestion === questions.length - 1 ? "Finish Quiz" : "Next"}
        </Button>
      </div>
    </div>
  );
}