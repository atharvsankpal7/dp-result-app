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

interface Result {
  _id: string;
  subject_id: {
    name: string;
    course_code: string;
  };
  ut1: number;
  ut2: number;
  terminal: number;
  annual_practical: number;
  annual_theory: number;
  total: number;
  remark: string;
}

export default function StudentDashboard() {
  const [student, setStudent] = useState<Student | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchStudentProfile();
    fetchResults();
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

  const fetchResults = async () => {
    try {
      const response = await fetch("/api/student/results");
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      }
    } catch (error) {
      console.error("Failed to fetch results:", error);
      toast.error("Failed to load results");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" }); 
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

      <Card>
        <CardHeader>
          <CardTitle>Academic Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50">
                <tr>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3">Division</th>
                  <th className="px-4 py-3">UT1 (25)</th>
                  <th className="px-4 py-3">UT2 (25)</th>
                  <th className="px-4 py-3">Terminal (50)</th>
                  <th className="px-4 py-3">Theory (100)</th>
                  <th className="px-4 py-3">Practical (100)</th>
                  <th className="px-4 py-3">Total (100)</th>
                  <th className="px-4 py-3">Remark</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result._id} className="border-b hover:bg-muted/50">
                    <td className="px-4 py-3 font-medium">{result.subject_id.name}</td>
                    <td className="px-4 py-3">{student.division_id?.class_id?.name}</td>
                    <td className="px-4 py-3">{student.division_id?.name}</td>
                    <td className="px-4 py-3">{result.ut1}</td>
                    <td className="px-4 py-3">{result.ut2}</td>
                    <td className="px-4 py-3">{result.terminal}</td>
                    <td className="px-4 py-3">{result.annual_theory}</td>
                    <td className="px-4 py-3">{result.annual_practical}</td>
                    <td className="px-4 py-3">{result.total}</td>
                    <td className={`px-4 py-3 font-bold ${result.remark === 'Pass' ? 'text-green-600' : 'text-red-600'}`}>
                      {result.remark}
                    </td>
                  </tr>
                ))}
                {results.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-4 py-3 text-center text-muted-foreground">
                      No results found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
