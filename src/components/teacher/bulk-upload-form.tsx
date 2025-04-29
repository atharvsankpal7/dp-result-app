"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

interface Subject {
  _id: string;
  name: string;
  course_code: string;
}

export const TeacherBulkUploadForm = () => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [assignedSubjects, setAssignedSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    fetchAssignedSubjects();
  }, []);

  const fetchAssignedSubjects = async () => {
    try {
      const response = await fetch("/api/teacher/subjects");
      if (!response.ok) {
        throw new Error("Failed to fetch assigned subjects");
      }
      const data = await response.json();
      setAssignedSubjects(data);
    } catch (error) {
      console.error("Error fetching assigned subjects:", error);
      toast.error("Failed to fetch assigned subjects");
    }
  };

  const handleFileUpload = async () => {
    if (!file) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/teacher/results/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload results");
      }

      const result = await response.json();
      toast.success("Results uploaded successfully");

      if (result.errors && result.errors.length > 0) {
        result.errors.forEach((error: string) => toast.error(error));
      }

      setFile(null);
    } catch (error) {
      console.error("Failed to upload results:", error);
      toast.error("Failed to upload results");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="flex-1"
            />
            <Button
              onClick={handleFileUpload}
              disabled={!file || loading}
            >
              <Upload className="mr-2 h-4 w-4" />
              {loading ? "Uploading..." : "Upload"}
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Upload an Excel file containing student results with the following columns:</p>
            <ul className="list-disc list-inside mt-2">
              <li>roll_number (Student Roll Number)</li>
              <li>ut1 (Unit Test 1 marks, max 25)</li>
              <li>ut2 (Unit Test 2 marks, max 25)</li>
              <li>terminal (Mid Term marks, max 50)</li>
              <li>annual_theory (Annual Theory marks)</li>
              <li>annual_practical (Annual Practical marks)</li>
            </ul>
          </div>

          <div className="mt-4">
            <h3 className="font-medium mb-2">Your Assigned Subjects:</h3>
            <ul className="list-disc list-inside">
              {assignedSubjects.map((subject) => (
                <li key={subject._id}>
                  {subject.name} ({subject.course_code})
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};