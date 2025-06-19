import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight } from "lucide-react";
import type { Submission, Feedback } from "@shared/schema";

interface FeedbackDisplayProps {
  submission: Submission;
  onTryAnother: () => void;
  onContinue: () => void;
}

export default function FeedbackDisplay({ 
  submission, 
  onTryAnother, 
  onContinue 
}: FeedbackDisplayProps) {
  const feedback = submission.feedback as Feedback;
  const score = submission.score || 0;
  const scorePercentage = (score / 10) * 100;
  
  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };
  
  const getScoreBgColor = (score: number) => {
    if (score >= 8) return "bg-green-600";
    if (score >= 6) return "bg-yellow-600";
    return "bg-red-600";
  };

  return (
    <Card className="bg-white rounded-xl shadow-md border border-gray-200 mt-8">
      <CardContent className="p-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center mr-3">
              <CheckCircle className="w-5 h-5 text-secondary" />
            </div>
            <h3 className="text-2xl font-heading font-bold text-secondary">
              AI Feedback Received
            </h3>
          </div>

          {/* Score Display */}
          <div className="bg-secondary/5 border border-secondary/20 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Overall Score</span>
              <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
                {score}/10
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${getScoreBgColor(score)}`}
                style={{ width: `${scorePercentage}%` }}
              />
            </div>
          </div>

          {/* Detailed Feedback */}
          <div className="space-y-4">
            {feedback.strengths && feedback.strengths.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">What You Did Well:</h4>
                <ul className="text-gray-700 space-y-1 ml-4">
                  {feedback.strengths.map((strength, index) => (
                    <li key={index}>• {strength}</li>
                  ))}
                </ul>
              </div>
            )}

            {feedback.improvements && feedback.improvements.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Areas for Improvement:</h4>
                <ul className="text-gray-700 space-y-1 ml-4">
                  {feedback.improvements.map((improvement, index) => (
                    <li key={index}>• {improvement}</li>
                  ))}
                </ul>
              </div>
            )}

            {feedback.comments && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Additional Comments:</h4>
                <p className="text-blue-800">{feedback.comments}</p>
              </div>
            )}
          </div>

          {/* Performance Badge */}
          <div className="mt-6 text-center">
            <Badge variant={score >= 7 ? "default" : "secondary"} className="px-4 py-2">
              {score >= 8 && "Excellent Work! 🌟"}
              {score >= 6 && score < 8 && "Good Job! 👍"}
              {score < 6 && "Keep Practicing! 💪"}
            </Badge>
          </div>

          <div className="flex justify-between pt-6">
            <Button 
              variant="outline"
              onClick={onTryAnother}
            >
              Try Another Example
            </Button>
            
            <Button 
              onClick={onContinue}
              className="flex items-center gap-2"
            >
              Continue to Next Lesson
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
