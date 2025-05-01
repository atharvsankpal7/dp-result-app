import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { Save, Check } from "lucide-react";

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

export const EditableResultsTable = () => {
  const [subject, setSubject] = useState<Subject | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [results, setResults] = useState<{ [key: string]: ResultData }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAssignedSubject();
  }, []);

  useEffect(() => {
    if (subject) {
      fetchStudents();
    }
  }, [subject]);

  const fetchAssignedSubject = async () => {
    try {
      const response = await fetch("/api/teacher/subjects");
      if (!response.ok) throw new Error("Failed to fetch subject");
      const data = await response.json();
      setSubject(data);
    } catch (error) {
      console.error("Error fetching subject:", error);
      toast.error("Failed to fetch assigned subject");
    }
  };

  const fetchStudents = async () => {
    if (!subject?._id) return;

    try {
      const response = await fetch(`/api/students?subject=${subject._id}`);
      if (!response.ok) throw new Error("Failed to fetch students");
      const data = await response.json();
      setStudents(data);

      // Initialize results object for new students
      const initialResults: { [key: string]: ResultData } = {};
      data.forEach((student: Student) => {
        initialResults[student._id] = {
          student_id: student._id,
          ut1: "",
          ut2: "",
          terminal: "",
          annual_theory: "",
          annual_practical: "",
        };
      });
      setResults(initialResults);

      // Fetch existing draft results
      const draftsResponse = await fetch("/api/teacher/results/drafts");
      if (draftsResponse.ok) {
        const draftsData = await draftsResponse.json();
        const draftResults = { ...initialResults };
        draftsData.forEach((draft: any) => {
          draftResults[draft.student_id._id] = {
            student_id: draft.student_id._id,
            ut1: draft.ut1.toString(),
            ut2: draft.ut2.toString(),
            terminal: draft.terminal.toString(),
            annual_theory: draft.annual_theory.toString(),
            annual_practical: draft.annual_practical.toString(),
          };
        });
        setResults(draftResults);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to fetch students");
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
        [field]: value,
      },
    }));
  };

  const validateResults = () => {
    for (const studentId in results) {
      const result = results[studentId];
      const ut1 = Number(result.ut1);
      const ut2 = Number(result.ut2);
      const terminal = Number(result.terminal);
      const annualTheory = Number(result.annual_theory);
      const annualPractical = Number(result.annual_practical);

      if (ut1 < 0 || ut1 > 25) return "UT1 marks must be between 0 and 25";
      if (ut2 < 0 || ut2 > 25) return "UT2 marks must be between 0 and 25";
      if (terminal < 0 || terminal > 50)
        return "Terminal marks must be between 0 and 50";
      if (annualTheory + annualPractical > 100)
        return "Total annual marks cannot exceed 100";
    }
    return null;
  };

  const handleSave = async () => {
    if (!subject) {
      toast.error("No subject assigned");
      return;
    }

    const error = validateResults();
    if (error) {
      toast.error(error);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/teacher/results/editable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject_id: subject._id,
          results: Object.values(results),
        }),
      });

      if (!response.ok) throw new Error("Failed to save results");
      toast.success("Results saved as draft");
    } catch (error) {
      console.error("Error saving results:", error);
      toast.error("Failed to save results");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!subject) {
      toast.error("No subject assigned");
      return;
    }

    const error = validateResults();
    if (error) {
      toast.error(error);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/teacher/results/submit", {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to submit results");
      toast.success("Results submitted successfully");
      await fetchStudents(); // Refresh the data
    } catch (error) {
      console.error("Error submitting results:", error);
      toast.error("Failed to submit results");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Enter Results for {subject?.name}</CardTitle>
        <div className="space-x-2">
          <Button onClick={handleSave} disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            Save as Draft
          </Button>
          <Button onClick={handleSubmit} disabled={loading} variant="default">
            <Check className="mr-2 h-4 w-4" />
            Submit Results
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {students.length > 0 ? (
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
                          value={results[student._id]?.ut1}
                          onChange={(e) =>
                            handleInputChange(
                              student._id,
                              "ut1",
                              e.target.value
                            )
                          }
                          min="0"
                          max="25"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <Input
                          type="number"
                          value={results[student._id]?.ut2}
                          onChange={(e) =>
                            handleInputChange(
                              student._id,
                              "ut2",
                              e.target.value
                            )
                          }
                          min="0"
                          max="25"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <Input
                          type="number"
                          value={results[student._id]?.terminal}
                          onChange={(e) =>
                            handleInputChange(
                              student._id,
                              "terminal",
                              e.target.value
                            )
                          }
                          min="0"
                          max="50"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <Input
                          type="number"
                          value={results[student._id]?.annual_theory}
                          onChange={(e) =>
                            handleInputChange(
                              student._id,
                              "annual_theory",
                              e.target.value
                            )
                          }
                          min="0"
                          max="70"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <Input
                          type="number"
                          value={results[student._id]?.annual_practical}
                          onChange={(e) =>
                            handleInputChange(
                              student._id,
                              "annual_practical",
                              e.target.value
                            )
                          }
                          min="0"
                          max="30"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No students found for this subject
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};