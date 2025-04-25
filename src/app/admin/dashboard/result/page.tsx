"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { api } from "@/lib/services/api";
import * as XLSX from "xlsx";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface Student {
  _id: string;
  name: string;
  roll_number: string;
}

interface Subject {
  name: string;
  course_code: string;
}

interface SubjectResult {
  subject_id: Subject;
  ut1: number;
  ut2: number;
  terminal: number;
  annual_practical: number;
  annual_theory: number;
  total: number;
  remark: "Pass" | "Fail";
}

interface Result {
  student_id: Student;
  subject_results: SubjectResult[];
}

interface ClassData {
  _id: string;
  name: string;
  divisions: Division[];
}

interface Division {
  _id: string;
  name: string;
}

interface ExamOption {
  id: string;
  label: string;
}

const EXAM_OPTIONS: ExamOption[] = [
  { id: "ut1", label: "UT-1" },
  { id: "ut2", label: "UT-2" },
  { id: "terminal", label: "Terminal" },
  { id: "annual", label: "Annual" },
  { id: "total", label: "Total & Remark" },
];

export default function ResultPage() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedDivision, setSelectedDivision] = useState<string>("");
  const [results, setResults] = useState<Result[]>([]);
  const [selectedExams, setSelectedExams] = useState<string[]>(
    EXAM_OPTIONS.map((option) => option.id)
  );

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedDivision) {
      fetchResults();
    }
  }, [selectedClass, selectedDivision]);

  const fetchClasses = async () => {
    try {
      const data = await api.getClasses();
      setClasses(data);

      if (data.length > 0) {
        const firstClass = data[0];
        setSelectedClass(firstClass._id);
      }
    } catch (error) {
      console.error("Failed to fetch classes:", error);
    }
  };

  const fetchResults = async () => {
    try {
      const response = await fetch(
        `/api/results/division?division=${selectedDivision}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch results");
      }
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Failed to fetch results:", error);
    }
  };

  const toggleExam = (examId: string) => {
    setSelectedExams((prev) =>
      prev.includes(examId)
        ? prev.filter((id) => id !== examId)
        : [...prev, examId]
    );
  };

  const handleDownload = () => {
    // Create worksheet data
    const wsData = [];

    // Add headers
    const headers = ["Roll No", "Name", "Subject"];
    if (selectedExams.includes("ut1")) headers.push("UT-1");
    if (selectedExams.includes("ut2")) headers.push("UT-2");
    if (selectedExams.includes("terminal")) headers.push("Terminal");
    if (selectedExams.includes("annual"))
      headers.push("Annual Theory", "Annual Practical");
    if (selectedExams.includes("total")) headers.push("Total", "Remark");
    wsData.push(headers);

    // Group results by roll number
    const groupedResults = results.reduce((acc, result) => {
      if (!acc[result.student_id.roll_number]) {
        acc[result.student_id.roll_number] = {
          student: result.student_id,
          subjects: [],
        };
      }
      acc[result.student_id.roll_number].subjects.push(
        ...result.subject_results
      );
      return acc;
    }, {} as Record<string, { student: Student; subjects: SubjectResult[] }>);

    // Add data rows
    Object.values(groupedResults).forEach(({ student, subjects }) => {
      subjects.forEach((subject, index) => {
        const row = [
          index === 0 ? student.roll_number : "", // Show roll number only for first subject
          index === 0 ? student.name : "", // Show name only for first subject
          subject.subject_id.name,
        ];
        if (selectedExams.includes("ut1")) row.push(subject.ut1.toString());
        if (selectedExams.includes("ut2")) row.push(subject.ut2.toString());
        if (selectedExams.includes("terminal")) row.push(subject.terminal.toString());
        if (selectedExams.includes("annual")) {
          row.push(subject.annual_theory.toString());
          row.push(subject.annual_practical.toString());
        }
        if (selectedExams.includes("total")) {
          row.push(subject.total.toString());
          row.push(subject.remark);
        }
        wsData.push(row);
      });      // Add a blank row between students
      wsData.push(Array(headers.length).fill(""));
    });

    // Add timestamp at the bottom
    wsData.push([
      `Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
    ]);

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Results");

    // Generate filename
    const className = classes.find((c) => c._id === selectedClass)?.name;
    const divisionName = classes
      .find((c) => c._id === selectedClass)
      ?.divisions.find((d) => d._id === selectedDivision)?.name;
    const filename = `${className}-${divisionName}-Results.xlsx`;

    // Download file
    XLSX.writeFile(wb, filename);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Results Management</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>View Results</CardTitle>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 border rounded-md p-2">
              <Label className="text-sm font-medium">Exams:</Label>
              <div className="flex flex-wrap gap-2">
                {EXAM_OPTIONS.map((option) => (
                  <div key={option.id} className="flex items-center space-x-1">
                    <Checkbox
                      id={`exam-${option.id}`}
                      checked={selectedExams.includes(option.id)}
                      onCheckedChange={() => toggleExam(option.id)}
                    />
                    <Label htmlFor={`exam-${option.id}`} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            {results.length > 0 && (
              <Button onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download Results
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((classData) => (
                    <SelectItem key={classData._id} value={classData._id}>
                      {classData.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedDivision}
                onValueChange={setSelectedDivision}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Division" />
                </SelectTrigger>
                <SelectContent>
                  {selectedClass &&
                    classes
                      .find((c) => c._id === selectedClass)
                      ?.divisions.map((division) => (
                        <SelectItem key={division._id} value={division._id}>
                          {division.name}
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="py-3 px-4 text-left">Roll No</th>
                    <th className="py-3 px-4 text-left">Name</th>
                    <th className="py-3 px-4 text-left">Subject</th>
                    {selectedExams.includes("ut1") && (
                      <th className="py-3 px-4 text-left">UT-1</th>
                    )}
                    {selectedExams.includes("ut2") && (
                      <th className="py-3 px-4 text-left">UT-2</th>
                    )}
                    {selectedExams.includes("terminal") && (
                      <th className="py-3 px-4 text-left">Terminal</th>
                    )}
                    {selectedExams.includes("annual") && (
                      <th className="py-3 px-4 text-center" colSpan={2}>
                        Annual
                      </th>
                    )}
                    {selectedExams.includes("total") && (
                      <>
                        <th className="py-3 px-4 text-left">Total</th>
                        <th className="py-3 px-4 text-left">Remark</th>
                      </>
                    )}
                  </tr>
                  {selectedExams.includes("annual") && (
                    <tr>
                      <th
                        className="py-1"
                        colSpan={
                          3 +
                          selectedExams.filter((e) =>
                            ["ut1", "ut2", "terminal"].includes(e)
                          ).length
                        }
                      ></th>
                      <th className="py-1 px-4">Theory</th>
                      <th className="py-1 px-4">Practical</th>
                      <th
                        className="py-1"
                        colSpan={
                          selectedExams.includes("total") ? 2 : 0
                        }
                      ></th>
                    </tr>
                  )}
                  
                </thead>
                <tbody>
                  {results.map((result) =>
                    result.subject_results.map((subjectResult, index) => (
                      <tr
                        key={`${result.student_id._id}-${index}`}
                        className="border-t"
                      >
                        {index === 0 && (
                          <>
                            <td
                              className="py-3 px-4"
                              rowSpan={result.subject_results.length}
                            >
                              {result.student_id.roll_number}
                            </td>
                            <td
                              className="py-3 px-4"
                              rowSpan={result.subject_results.length}
                            >
                              {result.student_id.name}
                            </td>
                          </>
                        )}
                        <td className="py-3 px-4">
                          {subjectResult.subject_id.name}
                        </td>
                        {selectedExams.includes("ut1") && (
                          <td className="py-3 px-4">{subjectResult.ut1}</td>
                        )}
                        {selectedExams.includes("ut2") && (
                          <td className="py-3 px-4">{subjectResult.ut2}</td>
                        )}
                        {selectedExams.includes("terminal") && (
                          <td className="py-3 px-4">
                            {subjectResult.terminal}
                          </td>
                        )}
                        {selectedExams.includes("annual") && (
                          <>
                            <td className="py-3 px-4">
                              {subjectResult.annual_theory}
                            </td>
                            <td className="py-3 px-4">
                              {subjectResult.annual_practical}
                            </td>
                          </>
                        )}
                        {selectedExams.includes("total") && (
                          <>
                            <td className="py-3 px-4">{subjectResult.total}</td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  subjectResult.remark === "Pass"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {subjectResult.remark}
                              </span>
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
