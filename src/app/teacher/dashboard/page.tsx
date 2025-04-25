'use client'

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
export default function TeacherDashboard() {
  
  const router = useRouter();
  useEffect(() => {
    router.push('/teacher/dashboard/upload-results');
  }, []);


  return (
    <div>
      Redirecting to Dashboard...
    </div>
  );
}