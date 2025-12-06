"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Student {
  _id: string;
  name: string;
  roll_number: string;
  mobile_number: string;
  division_id: {
    name: string;
    class_id: {
      name: string;
    };
  };
}

export default function StudentDashboard() {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchStudentProfile();
  }, []);

  const fetchStudentProfile = async () => {
    try {
      const response = await fetch("/api/student/me");
      if (response.ok) {
        const data = await response.json();
        setStudent(data);
      } else {
        router.push("/student/login");
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" }); // Assuming logout API exists or I need to create one/clear cookie
      // Actually, I should check if there is a logout API. If not, I'll just delete cookie client side or create one.
      // Usually /api/auth/logout or similar.
      // Let's assume I need to implement logout or just redirect to login which might not clear cookie.
      // I'll implement a simple logout by clearing cookie.
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      router.push("/student/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!student) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="text-lg">{student.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Roll Number</p>
              <p className="text-lg">{student.roll_number}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Class</p>
              <p className="text-lg">{student.division_id?.class_id?.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Division</p>
              <p className="text-lg">{student.division_id?.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Mobile Number</p>
              <p className="text-lg">{student.mobile_number}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
