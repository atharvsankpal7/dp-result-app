"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import toast from "react-hot-toast";

interface Student {
  _id: string;
  name: string;
  roll_number: string;
}

interface Subject {
  _id: string;
  name: string;
  course_code: string;
}

interface BufferedResult {
  _id: string;
  student_id: Student;
  subject_id: Subject;
  ut1: number;
  ut2: number;
  terminal: number;
  annual_theory: number;
  annual_practical: number;
  total: number;
  remark: "Pass" | "Fail";
  status: "draft" | "submitted" | "approved";
  teacher_id: {
    _id: string;
    name: string;
    email: string;
  };
}

export default function SubmittedResultsPage() {
  const [results, setResults] = useState<BufferedResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSubmittedResults();
  }, []);

  const fetchSubmittedResults = async () => {
    try {
      const response = await fetch("/api/admin/results/submitted");
      if (!response.ok) throw new Error("Failed to fetch submitted results");
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Error fetching submitted results:", error);
      toast.error("Failed to fetch submitted results");
    }
  };

  const handleApprove = async (resultId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/results/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resultId }),
      });

      if (!response.ok) throw new Error("Failed to approve result");
      
      toast.success("Result approved successfully");
      await fetchSubmittedResults();
    } catch (error) {
      console.error("Error approving result:", error);
      toast.error("Failed to approve result");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (resultId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/results/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resultId }),
      });

      if (!response.ok) throw new Error("Failed to reject result");
      
      toast.success("Result rejected successfully");
      await fetchSubmittedResults();
    } catch (error) {
      console.error("Error rejecting result:", error);
      toast.error("Failed to reject result");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Submitted Results</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Review Submitted Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="py-3 px-4 text-left">Teacher</th>
                  <th className="py-3 px-4 text-left">Roll No</th>
                  <th className="py-3 px-4 text-left">Student Name</th>
                  <th className="py-3 px-4 text-left">Subject</th>
                  <th className="py-3 px-4 text-left">UT-1</th>
                  <th className="py-3 px-4 text-left">UT-2</th>
                  <th className="py-3 px-4 text-left">Terminal</th>
                  <th className="py-3 px-4 text-center" colSpan={2}>Annual</th>
                  <th className="py-3 px-4 text-left">Total</th>
                  <th className="py-3 px-4 text-left">Remark</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
                <tr>
                  <th className="py-1" colSpan={7}></th>
                  <th className="py-1 px-4">Theory</th>
                  <th className="py-1 px-4">Practical</th>
                  <th className="py-1" colSpan={3}></th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result._id} className="border-t">
                    <td className="py-3 px-4">{result.teacher_id.name}</td>
                    <td className="py-3 px-4">{result.student_id.roll_number}</td>
                    <td className="py-3 px-4">{result.student_id.name}</td>
                    <td className="py-3 px-4">{result.subject_id.name}</td>
                    <td className="py-3 px-4">{result.ut1}</td>
                    <td className="py-3 px-4">{result.ut2}</td>
                    <td className="py-3 px-4">{result.terminal}</td>
                    <td className="py-3 px-4">{result.annual_theory}</td>
                    <td className="py-3 px-4">{result.annual_practical}</td>
                    <td className="py-3 px-4">{result.total}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          result.remark === "Pass"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {result.remark}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(result._id)}
                          disabled={loading}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(result._id)}
                          disabled={loading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}