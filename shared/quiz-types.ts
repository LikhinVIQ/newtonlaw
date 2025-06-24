export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // Index of correct option
  explanation: string;
}

export interface QuizResult {
  questionId: number;
  selectedAnswer: number;
  correct: boolean;
}

export interface QuizScore {
  correct: number;
  total: number;
  percentage: number;
}