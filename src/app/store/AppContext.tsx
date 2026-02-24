import React, { createContext, useContext, useState, useEffect } from 'react';
import { format } from 'date-fns';

// Types
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

interface AppState {
  currentUser: User;
  folders: Folder[];
  tasks: Task[];
  exams: Exam[];
}

interface AppContextType extends AppState {
  switchUser: (user: User) => void;
  addFolder: (name: string, color: string) => void;
  addTask: (title: string, folderId: string) => void;
  toggleTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  addExam: (exam: Omit<Exam, 'id'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial Data
const INITIAL_FOLDERS: Folder[] = [
  { id: 'f1', name: 'Matematik', color: 'bg-blue-100' },
  { id: 'f2', name: 'Edebiyat', color: 'bg-amber-100' },
  { id: 'f3', name: 'Tarih', color: 'bg-emerald-100' },
  { id: 'f4', name: 'Genel Tekrar', color: 'bg-rose-100' },
];

const INITIAL_TASKS: Task[] = [
  { id: 't1', title: 'Türev testini çöz', completed: false, folderId: 'f1', assignedBy: 'furkan', createdAt: new Date().toISOString() },
  { id: 't2', title: 'Cumhuriyet dönemi roman özeti', completed: true, folderId: 'f2', assignedBy: 'seyda', createdAt: new Date().toISOString() },
  { id: 't3', title: 'Deneme analizi yap', completed: false, folderId: 'f4', assignedBy: 'furkan', createdAt: new Date().toISOString() },
];

const INITIAL_EXAMS: Exam[] = [
  { id: 'e1', title: 'TYT Deneme 1', score: 85, totalQuestions: 120, date: '2026-02-10' },
  { id: 'e2', title: 'AYT Deneme 1', score: 60, totalQuestions: 80, date: '2026-02-15' },
  { id: 'e3', title: 'TYT Deneme 2', score: 92, totalQuestions: 120, date: '2026-02-22' },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>('seyda');
  const [folders, setFolders] = useState<Folder[]>(INITIAL_FOLDERS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [exams, setExams] = useState<Exam[]>(INITIAL_EXAMS);

  const switchUser = (user: User) => setCurrentUser(user);

  const addFolder = (name: string, color: string) => {
    const newFolder: Folder = { id: Math.random().toString(36).substr(2, 9), name, color };
    setFolders([...folders, newFolder]);
  };

  const addTask = (title: string, folderId: string) => {
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      completed: false,
      folderId,
      assignedBy: currentUser,
      createdAt: new Date().toISOString(),
    };
    setTasks([...tasks, newTask]);
  };

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const addExam = (exam: Omit<Exam, 'id'>) => {
    setExams([...exams, { ...exam, id: Math.random().toString(36).substr(2, 9) }]);
  };

  return (
    <AppContext.Provider value={{
      currentUser, folders, tasks, exams,
      switchUser, addFolder, addTask, toggleTask, deleteTask, addExam
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
