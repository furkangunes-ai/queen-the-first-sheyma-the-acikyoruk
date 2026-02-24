import { create } from 'zustand';
import type { User, Folder, Task, Exam } from '@/types';

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

interface AppStore {
  currentUser: User;
  folders: Folder[];
  tasks: Task[];
  exams: Exam[];
  switchUser: (user: User) => void;
  addFolder: (name: string, color: string) => void;
  addTask: (title: string, folderId: string) => void;
  toggleTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  addExam: (exam: Omit<Exam, 'id'>) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  currentUser: 'seyda',
  folders: INITIAL_FOLDERS,
  tasks: INITIAL_TASKS,
  exams: INITIAL_EXAMS,

  switchUser: (user) => set({ currentUser: user }),

  addFolder: (name, color) => {
    const newFolder: Folder = { id: Math.random().toString(36).substr(2, 9), name, color };
    set((state) => ({ folders: [...state.folders, newFolder] }));
  },

  addTask: (title, folderId) => {
    const { currentUser } = get();
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      completed: false,
      folderId,
      assignedBy: currentUser,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ tasks: [...state.tasks, newTask] }));
  },

  toggleTask: (taskId) => {
    set((state) => ({
      tasks: state.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t),
    }));
  },

  deleteTask: (taskId) => {
    set((state) => ({
      tasks: state.tasks.filter(t => t.id !== taskId),
    }));
  },

  addExam: (exam) => {
    set((state) => ({
      exams: [...state.exams, { ...exam, id: Math.random().toString(36).substr(2, 9) }],
    }));
  },
}));
