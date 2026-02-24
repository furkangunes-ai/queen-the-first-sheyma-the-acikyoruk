// User types
export type User = 'furkan' | 'seyda';

export interface Folder {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  folderId: string;
  assignedBy: User;
  createdAt: string;
}

export interface Exam {
  id: string;
  title: string;
  score: number;
  totalQuestions: number;
  date: string;
  image?: string;
}
