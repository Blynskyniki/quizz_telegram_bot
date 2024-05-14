export interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  pollId: string | null;
}

export interface Participant {
  rider: string;
  horse: string;
}

export interface UserResult {
  username: string;
  correctAnswers: number;
  totalQuestions: number;
}

