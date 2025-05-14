"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { Save } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/services/api";

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

interface ResultData {
  student_id: string;
  ut1: string;
  ut2: string;
  terminal: string;
  annual_theory: string;
  annual_practical: string;
}

interface ExistingResult {
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
}

const AdminEditResultsPage = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [results, setResults] = useState<{ [key: string]: ResultData }>({});
  const [existingResults, setExistingResults] = useState<{ [key: string]: ExistingResult }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      fetchStudents();
    }
  }, [selectedSubject]);

  const fetchSubjects = async () => {
    try {
      const data = await api.getSubjects();
      setSubjects(data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      toast.error("Failed to fetch subjects");
    }
  };

  const fetchStudents = async () => {
    if (!selectedSubject) return;

    try {
      const response = await fetch(`/api/students?subject=${selectedSubject}`);
      if (!response.ok) throw new Error("Failed to fetch students");
      const studentsData = await response.json();
      setStudents(studentsData);

      // Fetch existing results
      const resultsResponse = await fetch(`/api/results?subject=${selectedSubject}`);
      if (resultsResponse.ok) {
        const existingResultsData = await resultsResponse.json();
        const resultsMap: { [key: string]: ExistingResult } = {};
        existingResultsData.forEach((result: ExistingResult) => {
          resultsMap[result.student_id._id] = result;
        });
        setExistingResults(resultsMap);

        // Initialize results state with existing data
        const initialResults: { [key: string]: ResultData } = {};
        studentsData.forEach((student: Student) => {
          const existingResult = resultsMap[student._id];
          initialResults[student._id] = {
            student_id: student._id,
            ut1: existingResult?.ut1?.toString() || "",
            ut2: existingResult?.ut2?.toString() || "",
            terminal: existingResult?.terminal?.toString() || "",
            annual_theory: existingResult?.annual_theory?.toString() || "",
            annual_practical: existingResult?.annual_practical?.toString() || "",
          };
        });
        setResults(initialResults);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data");
    }
  };

  const handleInputChange = (
    studentId: string,
    field: keyof ResultData,
    value: string
  ) => {
    setResults((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        student_id: studentId,
        [field]: value,
      },
    }));
  };

  const validateResults = () => {
    for (const studentId in results) {
      const result = results[studentId];
      if (!result) continue;

      const ut1 = Number(result.ut1);
      const ut2 = Number(result.ut2);
      const terminal = Number(result.terminal);
      const annualTheory = Number(result.annual_theory);
      const annualPractical = Number(result.annual_practical);

      if (result.ut1 && (ut1 < 0 || ut1 > 25)) return "UT1 marks must be between 0 and 25";
      if (result.ut2 && (ut2 < 0 || ut2 > 25)) return "UT2 marks must be between 0 and 25";
      if (result.terminal && (terminal < 0 || terminal > 50)) return "Terminal marks must be between 0 and 50";
      if ((result.annual_theory || result.annual_practical) && (annualTheory + annualPractical > 100))
        return "Total annual marks cannot exceed 100";
    }
    return null;
  };

  const handleSave = async () => {
    if (!selectedSubject) return;

    const error = validateResults();
    if (error) {
      toast.error(error);
      return;
    }

    setLoading(true);
    try {
      const resultsToSubmit = Object.values(results).filter(result => 
        result.ut1 || result.ut2 || result.terminal || result.annual_theory || result.annual_practical
      );

      for (const result of resultsToSubmit) {
        await fetch("/api/results", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...result,
            subject_id: selectedSubject,
          }),
        });
      }

      toast.success("Results saved successfully");
      await fetchStudents(); // Refresh existing results
    } catch (error) {
      console.error("Error saving results:", error);
      toast.error("Failed to save results");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Edit Results</h1>
      <Card>
        <CardHeader>
          <CardTitle>Select Subject</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger>
              <SelectValue placeholder="Select a subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject._id} value={subject._id}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedSubject && students.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Edit Results</CardTitle>
            <Button onClick={handleSave} disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              Save Results
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="py-3 px-4 text-left">Roll No</th>
                    <th className="py-3 px-4 text-left">Name</th>
                    <th className="py-3 px-4 text-left">UT-1</th>
                    <th className="py-3 px-4 text-left">UT-2</th>
                    <th className="py-3 px-4 text-left">Terminal</th>
                    <th className="py-3 px-4 text-left">Annual Theory</th>
                    <th className="py-3 px-4 text-left">Annual Practical</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student._id} className="border-t">
                      <td className="py-3 px-4">{student.roll_number}</td>
                      <td className="py-3 px-4">{student.name}</td>
                      <td className="py-3 px-4">
                        <Input
                          type="number"
                          value={results[student._id]?.ut1 || ""}
                          onChange={(e) =>
                            handleInputChange(
                              student._id,
                              "ut1",
                              e.target.value
                            )
                          }
                          min="0"
                          max="25"
                          placeholder={existingResults[student._id]?.ut1?.toString() || ""}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <Input
                          type="number"
                          value={results[student._id]?.ut2 || ""}
                          onChange={(e) =>
                            handleInputChange(
                              student._id,
                              "ut2",
                              e.target.value
                            )
                          }
                          min="0"
                          max="25"
                          placeholder={existingResults[student._id]?.ut2?.toString() || ""}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <Input
                          type="number"
                          value={results[student._id]?.terminal || ""}
                          onChange={(e) =>
                            handleInputChange(
                              student._id,
                              "terminal",
                              e.target.value
                            )
                          }
                          min="0"
                          max="50"
                          placeholder={existingResults[student._id]?.terminal?.toString() || ""}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <Input
                          type="number"
                          value={results[student._id]?.annual_theory || ""}
                          onChange={(e) =>
                            handleInputChange(
                              student._id,
                              "annual_theory",
                              e.target.value
                            )
                          }
                          min="0"
                          max="70"
                          placeholder={existingResults[student._id]?.annual_theory?.toString() || ""}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <Input
                          type="number"
                          value={results[student._id]?.annual_practical || ""}
                          onChange={(e) =>
                            handleInputChange(
                              student._id,
                              "annual_practical",
                              e.target.value
                            )
                          }
                          min="0"
                          max="30"
                          placeholder={existingResults[student._id]?.annual_practical?.toString() || ""}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminEditResultsPage;    