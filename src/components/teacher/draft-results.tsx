
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Save } from "lucide-react";
import toast from "react-hot-toast";

interface DraftResult {
  _id: string;
  student_id: {
    _id: string;
    name: string;
    roll_number: string;
  };
  subject_id: {
    _id: string;
    name: string;
    course_code: string;
  };
  ut1: number;
  ut2: number;
  terminal: number;
  annual_theory: number;
  annual_practical: number;
  total: number;
  remark: "Pass" | "Fail";
  status: "draft" | "submitted" | "approved";
}

export const DraftResults = () => {
  const [draftResults, setDraftResults] = useState<DraftResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 30;

  useEffect(() => {
    fetchDraftResults();
  }, [currentPage]);

  const fetchDraftResults = async () => {
    try {
      const response = await fetch(
        `/api/teacher/results/drafts?page=${currentPage}&limit=${resultsPerPage}`
      );
      
      const data = await response.json();
      setDraftResults(data);
    } catch (error) {
      console.error("Error fetching draft results:", error);
      toast.error("Failed to fetch draft results");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/teacher/results/submit", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to submit results");
      }
      toast.success("Results submitted successfully");
      await fetchDraftResults();
    } catch (error) {
      console.error("Error submitting results:", error);
      toast.error("Failed to submit results");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/teacher/results/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ results: draftResults }),
      });
      if (!response.ok) {
        throw new Error("Failed to save results");
      }
      toast.success("Results saved successfully");
    } catch (error) {
      console.error("Error saving results:", error);
      toast.error("Failed to save results");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Draft Results</CardTitle>
        <div className="space-x-2">
          <Button onClick={handleSave} disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            <Check className="mr-2 h-4 w-4" />
            Submit
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="py-3 px-4 text-left">Roll No</th>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Subject</th>
                <th className="py-3 px-4 text-left">UT-1</th>
                <th className="py-3 px-4 text-left">UT-2</th>
                <th className="py-3 px-4 text-left">Terminal</th>
                <th className="py-3 px-4 text-center" colSpan={2}>Annual</th>
                <th className="py-3 px-4 text-left">Total</th>
                <th className="py-3 px-4 text-left">Remark</th>
              </tr>
              <tr>
                <th className="py-1" colSpan={6}></th>
                <th className="py-1 px-4">Theory</th>
                <th className="py-1 px-4">Practical</th>
                <th className="py-1" colSpan={2}></th>
              </tr>
            </thead>
            <tbody>
              {draftResults.map((result) => (
                <tr key={result._id} className="border-t">
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
