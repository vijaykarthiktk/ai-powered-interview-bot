export type InterviewRole = {
  id: string;
  title: string;
  description: string;
  category: 'technical' | 'non-technical';
};

export type Question = {
  id: string;
  text: string;
  category: 'behavioral' | 'technical' | 'general';
  difficulty: 'easy' | 'medium' | 'hard';
};

export type Answer = {
  questionId: string;
  text: string;
  feedback: string;
  score: number;
  timestamp: Date;
};

export type InterviewSession = {
  role: InterviewRole;
  questions: Question[];
  currentQuestionIndex: number;
  answers: Answer[];
  status: 'not-started' | 'role-selection' | 'in-progress' | 'completed';
};