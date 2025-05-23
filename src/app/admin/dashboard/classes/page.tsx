"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { api } from "@/lib/services/api";
import toast from "react-hot-toast";

interface Class {
  _id: string;
  name: string;
  divisions: Division[];
}

interface Division {
  _id: string;
  name: string;
  subjects: {
    _id: string;
    name: string;
    course_code: string;
  }[];
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [newClassName, setNewClassName] = useState("");
  const [newDivisionName, setNewDivisionName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [divisionError, setDivisionError] = useState<string | null>(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const data = await api.getClasses();
      setClasses(data);
      setSelectedClass(data[0]?._id || "");
    } catch (error) {
      toast.error("Failed to fetch classes");
    }
  };

  const handleAddClass = async () => {
    if (!newClassName.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await api.createClass({ name: newClassName });
      setNewClassName("");
      await fetchClasses();
      toast.success("Class added successfully");
    } catch (error) {
      setError("Failed to add class");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDivision = async () => {
    if (!selectedClass || !newDivisionName.trim()) return;
    setLoading(true);
    setDivisionError(null);
    try {
      const response = await fetch('/api/divisions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newDivisionName,
          class_id: selectedClass,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error(data.error || 'Division with this name already exists in this class');
        }
        throw new Error(data.error || 'Failed to add division');
      }

      setNewDivisionName("");
      await fetchClasses();
      toast.success("Division added successfully");
    } catch (error) {
      setDivisionError(error instanceof Error ? error.message : 'Failed to add division');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (classId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this class?");
    if (!confirmed) {
      return;
    }

    setLoading(true);
    try {
      await api.deleteClass(classId);
      await fetchClasses();
      toast.success("Class deleted successfully");
    } catch (error) {
      toast.error("Failed to delete class");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Classes & Divisions</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Enter class name (e.g., 10th)"
                  className="flex-1"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                />
                <Button
                  onClick={handleAddClass}
                  disabled={loading || !newClassName.trim()}
                >
                  Add Class
                </Button>
              </div>
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="py-3 px-4 text-left">Class Name</th>
                      <th className="py-3 px-4 text-left">Divisions</th>
                      <th className="py-3 px-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.map((class_) => (
                      <tr key={class_._id} className="border-t">
                        <td className="py-3 px-4">{class_.name}</td>
                        <td className="py-3 px-4">
                          {class_?.divisions?.map((d) => d.name).join(", ")}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteClass(class_._id)}
                              disabled={loading}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Divisions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {divisionError && (
                <Alert variant="destructive">
                  <AlertDescription>{divisionError}</AlertDescription>
                </Alert>
              )}
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((class_) => (
                    <SelectItem key={class_._id} value={class_._id}>
                      {class_.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Enter division name (e.g., A)"
                  className="flex-1"
                  value={newDivisionName}
                  onChange={(e) => setNewDivisionName(e.target.value)}
                />
                <Button
                  onClick={handleAddDivision}
                  disabled={
                    loading || !selectedClass || !newDivisionName.trim()
                  }
                >
                  Add Division
                </Button>
              </div>
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="py-3 px-4 text-left">Division Name</th>
                      <th className="py-3 px-4 text-left">Subjects</th>
                      <th className="py-3 px-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedClass &&
                      classes
                        .find((c) => c._id === selectedClass)
                        ?.divisions.map((division) => (
                          <tr key={division._id} className="border-t">
                            <td className="py-3 px-4">{division.name}</td>
                            <td className="py-3 px-4">
                              {division?.subjects?.map((subject, index) =>
                                index === division.subjects.length - 1
                                  ? subject.name
                                  : subject.name + ", "
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="destructive" size="sm">
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}