"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Plus, Edit, Delete, Trash } from "lucide-react";
import { api } from "@/lib/services/api";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import toast from "react-hot-toast";

interface Student {
  _id: string;
  name: string;
  mother_name: string;
  roll_number: string;
  status: "Active" | "Inactive" | "Admission Cancelled";
  division_id: {
    _id: string;
    name: string;
    class_id: {
      _id: string;
      name: string;
    };
  };
}

interface Class {
  _id: string;
  name: string;
  divisions: {
    _id: string;
    name: string;
  }[];
}

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  mother_name: z.string().min(1, { message: "Mother's name is required" }),
  roll_number: z.string().min(1, { message: "Roll number is required" }),
  division_id: z.string().min(1, { message: "Division is required" }),
});

const editFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  mother_name: z.string().min(1, { message: "Mother's name is required" }),
  division_id: z.string().min(1, { message: "Division is required" }),
  status: z.enum(["Active", "Inactive", "Admission Cancelled"]),
});

export default function StudentsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedUploadClass, setSelectedUploadClass] = useState("");
  const [selectedUploadDivision, setSelectedUploadDivision] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      mother_name: "",
      roll_number: "",
      division_id: "",
    },
  });

  const editForm = useForm<z.infer<typeof editFormSchema>>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      name: "",
      mother_name: "",
      division_id: "",
      status: "Active",
    },
  });

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      editForm.reset({
        name: selectedStudent.name,
        mother_name: selectedStudent.mother_name,
        division_id: selectedStudent.division_id._id,
        status: selectedStudent.status,
      });
    }
  }, [selectedStudent, editForm]);

  const fetchStudents = async () => {
    try {
      const data = await api.getStudents();
      setStudents(data);
      setSelectedClass(data[0]?.division_id?.class_id?._id || "");
    } catch (error) {
      toast.error("Failed to fetch students");
    }
  };

  const fetchClasses = async () => {
    try {
      const data = await api.getClasses();
      setClasses(data);
    } catch (error) {
      toast.error("Failed to fetch classes");
    }
  };

  const handleFileUpload = async () => {
    if (!file || !selectedUploadDivision) return;
    setLoading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("division_id", selectedUploadDivision);

      const response = await fetch("/api/students/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload students");
      }

      setFile(null);
      setSelectedUploadClass("");
      setSelectedUploadDivision("");
      await fetchStudents();
      toast.success("Students uploaded successfully");
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Failed to upload students"
      );
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error(
            data.error || "Student with this roll number already exists"
          );
        }
        throw new Error(data.error || "Failed to add student");
      }

      form.reset();
      await fetchStudents();
      toast.success("Student added successfully");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to add student"
      );
    } finally {
      setLoading(false);
    }
  };

  const onEditSubmit = async (values: z.infer<typeof editFormSchema>) => {
    if (!selectedStudent) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/students/${selectedStudent._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to update student");
      }

      setIsEditDialogOpen(false);
      setSelectedStudent(null);
      await fetchStudents();
      toast.success("Student updated successfully");
    } catch (error) {
      toast.error("Failed to update student");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setIsEditDialogOpen(true);
  };
  const handleDelete = async (studentId: string) => {
    try {
      const confirmed = window.confirm(
        "Are you sure you want to delete this student?"
      );
      if (!confirmed) {
        return;
      }

      await api.deleteStudent(studentId);
      await fetchStudents();
      toast.success("Student deleted successfully");
    } catch (error) {
      toast.error("Failed to delete student");
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Students Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Add Single Student</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Student name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mother_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mother&apos;s Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Mother's name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="roll_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Roll Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Roll number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <Select
                    value={selectedClass}
                    onValueChange={setSelectedClass}
                  >
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

                  <FormField
                    control={form.control}
                    name="division_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Division</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={!selectedClass}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Division" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedClass &&
                              classes
                                .find((c) => c._id === selectedClass)
                                ?.divisions.map((division) => (
                                  <SelectItem
                                    key={division._id}
                                    value={division._id}
                                  >
                                    {division.name}
                                  </SelectItem>
                                ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" disabled={loading}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Student
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bulk Upload Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploadError && (
                <Alert variant="destructive">
                  <AlertDescription>{uploadError}</AlertDescription>
                </Alert>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  value={selectedUploadClass}
                  onValueChange={setSelectedUploadClass}
                >
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

                <Select
                  value={selectedUploadDivision}
                  onValueChange={setSelectedUploadDivision}
                  disabled={!selectedUploadClass}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Division" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedUploadClass &&
                      classes
                        .find((c) => c._id === selectedUploadClass)
                        ?.divisions.map((division) => (
                          <SelectItem key={division._id} value={division._id}>
                            {division.name}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="flex-1"
                />
                <Button
                  onClick={handleFileUpload}
                  disabled={!file || !selectedUploadDivision || loading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {loading ? "Uploading..." : "Upload"}
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                Upload an Excel file containing student details: Name, Mother&apos;s
                Name, Roll Number
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Students List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="py-3 px-4 text-left">Roll No</th>
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">Mother&apos;s Name</th>
                  <th className="py-3 px-4 text-left">Class</th>
                  <th className="py-3 px-4 text-left">Division</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id} className="border-t">
                    <td className="py-3 px-4">{student.roll_number}</td>
                    <td className="py-3 px-4">{student.name}</td>
                    <td className="py-3 px-4">{student.mother_name}</td>
                    <td className="py-3 px-4">
                      {student.division_id?.class_id.name}
                    </td>
                    <td className="py-3 px-4">{student.division_id?.name}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          student.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : student.status === "Inactive"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {student.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 flex justify-center items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(student)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(student._id)}
                      >
                        <Trash className="h-4 w-4 " />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(onEditSubmit)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Student name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="mother_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mother&apos;s Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Mother's name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
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

                <FormField
                  control={editForm.control}
                  name="division_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Division</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={!selectedClass}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Division" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedClass &&
                            classes
                              .find((c) => c._id === selectedClass)
                              ?.divisions.map((division) => (
                                <SelectItem
                                  key={division._id}
                                  value={division._id}
                                >
                                  {division.name}
                                </SelectItem>
                              ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                          <SelectItem value="Admission Cancelled">
                            Admission Cancelled
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
