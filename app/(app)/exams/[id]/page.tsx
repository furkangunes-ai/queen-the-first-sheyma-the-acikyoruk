"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import ExamDetailView from '@/components/exams/exam-detail-view';

export default function ExamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;

  return (
    <ExamDetailView
      examId={examId}
      onBack={() => router.push('/exams')}
      onDeleted={() => router.push('/exams')}
    />
  );
}
