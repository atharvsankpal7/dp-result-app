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
import { api } from "@/lib/services/api";

interface Result {
  student_id: {
    _id: string;
    name: string;
    roll_number: string;
  };
  subject_results: {
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
    remark: "Pass" | "Fail";
  }[];
}

export default function ResultPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedDivision, setSelectedDivision] = useState("");
  const [results, setResults] = useState<Result[]>([]);

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Results Management</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>View Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger>
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((class_: any) => (
                  <SelectItem key={class_._id} value={class_._id}>
                    {class_.name}
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
                    .find((c: any) => c._id === selectedClass)
                    ?.divisions.map((division: any) => (
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
                  <th className="py-3 px-4 text-left">UT-1</th>
                  <th className="py-3 px-4 text-left">UT-2</th>
                  <th className="py-3 px-4 text-left">Terminal</th>
                  <th className="py-3 px-4 text-center" colSpan={2}>
                    Annual
                  </th>
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
                {results.map((result) =>
                  result.subject_results.map((subjectResult, index) => (
                    <tr
                      key={`${result.student_id._id}-${subjectResult.subject_id.name}`}
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
                      <td className="py-3 px-4">{subjectResult.ut1}</td>
                      <td className="py-3 px-4">{subjectResult.ut2}</td>
                      <td className="py-3 px-4">{subjectResult.terminal}</td>
                      <td className="py-3 px-4">
                        {subjectResult.annual_theory}
                      </td>
                      <td className="py-3 px-4">
                        {subjectResult.annual_practical}
                      </td>
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
