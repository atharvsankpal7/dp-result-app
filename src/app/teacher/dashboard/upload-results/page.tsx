'use client'

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Upload } from 'lucide-react';
import { api } from '@/lib/services/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

interface AssignedSubject {
  subject_id: {
    _id: string;
    name: string;
  };
  division_id: {
    _id: string;
    name: string;
    class_id: {
      _id: string;
      name: string;
    };
  };
}

const singleResultSchema = z.object({
  roll_number: z.string().min(1, "Roll number is required"),
  ut1: z.string().transform(Number).pipe(
    z.number().min(0).max(25, "UT1 marks must be between 0 and 25")
  ),
  ut2: z.string().transform(Number).pipe(
    z.number().min(0).max(25, "UT2 marks must be between 0 and 25")
  ),
  mid_term: z.string().transform(Number).pipe(
    z.number().min(0).max(50, "Mid-term marks must be between 0 and 50")
  ),
  annual: z.string().transform(Number).pipe(
    z.number().min(0).max(100, "Annual marks must be between 0 and 100")
  ),
});

export default function UploadResults() {
  const { user } = useAuth();
  const [assignedSubjects, setAssignedSubjects] = useState<AssignedSubject[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof singleResultSchema>>({
    resolver: zodResolver(singleResultSchema),
    defaultValues: {
      roll_number: "",
      ut1: "",
      ut2: "",
      mid_term: "",
      annual: "",
    },
  });

  useEffect(() => {
    if (user?.id) {
      fetchAssignedSubjects();
    }
  }, [user]);

  const fetchAssignedSubjects = async () => {
    try {
      if (user?.id) {
        const data = await api.getAssignedSubjects(user.id);
        setAssignedSubjects(data);
      }
    } catch (error) {
      console.error('Failed to fetch assigned subjects:', error);
      toast.error('Failed to fetch assigned subjects');
    }
  };

  const handleFileUpload = async () => {
    if (!file || !selectedDivision || !selectedSubject) return;
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('divisionId', selectedDivision);
      formData.append('subjectId', selectedSubject);

      const response = await fetch('/api/results/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload results');
      }

      const result = await response.json();
      toast.success('Results uploaded successfully');
      
      if (result.errors && result.errors.length > 0) {
        result.errors.forEach((error: string) => toast.error(error));
      }

      setFile(null);
    } catch (error) {
      console.error('Failed to upload results:', error);
      toast.error('Failed to upload results');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitSingleResult = async (values: z.infer<typeof singleResultSchema>) => {
    if (!selectedDivision || !selectedSubject) {
      toast.error('Please select division and subject');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          division_id: selectedDivision,
          subject_id: selectedSubject,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add result');
      }

      toast.success('Result added successfully');
      form.reset();
    } catch (error) {
      console.error('Failed to add result:', error);
      toast.error('Failed to add result');
    } finally {
      setLoading(false);
    }
  };

  const getClasses = () => {
    const classes = new Map();
    assignedSubjects.forEach(assignment => {
      const classId = assignment.division_id.class_id._id;
      classes.set(classId, {
        id: classId,
        name: assignment.division_id.class_id.name,
      });
    });
    return Array.from(classes.values());
  };

  const getDivisions = () => {
    const divisions = new Map();
    assignedSubjects.forEach(assignment => {
      if (assignment.division_id.class_id._id === selectedClass) {
        divisions.set(assignment.division_id._id, {
          id: assignment.division_id._id,
          name: assignment.division_id.name,
        });
      }
    });
    return Array.from(divisions.values());
  };

  const getSubjects = () => {
    return assignedSubjects
      .filter(assignment => 
        assignment.division_id._id === selectedDivision
      )
      .map(assignment => ({
        id: assignment.subject_id._id,
        name: assignment.subject_id.name,
      }));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Upload Results</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Add Single Result</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitSingleResult)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                      {getClasses().map((class_) => (
                        <SelectItem key={class_.id} value={class_.id}>
                          {class_.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select 
                    value={selectedDivision} 
                    onValueChange={setSelectedDivision}
                    disabled={!selectedClass}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Division" />
                    </SelectTrigger>
                    <SelectContent>
                      {getDivisions().map((division) => (
                        <SelectItem key={division.id} value={division.id}>
                          {division.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select 
                    value={selectedSubject} 
                    onValueChange={setSelectedSubject}
                    disabled={!selectedDivision}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {getSubjects().map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <FormField
                  control={form.control}
                  name="roll_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Roll Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="ut1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>UT-1 Marks (out of 25)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ut2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>UT-2 Marks (out of 25)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="mid_term"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mid-Term Marks (out of 50)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="annual"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Annual Marks (out of 100)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={loading || !selectedDivision || !selectedSubject}
                  className="w-full"
                >
                  Add Result
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bulk Upload Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {getClasses().map((class_) => (
                      <SelectItem key={class_.id} value={class_.id}>
                        {class_.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select 
                  value={selectedDivision} 
                  onValueChange={setSelectedDivision}
                  disabled={!selectedClass}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Division" />
                  </SelectTrigger>
                  <SelectContent>
                    {getDivisions().map((division) => (
                      <SelectItem key={division.id} value={division.id}>
                        {division.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select 
                  value={selectedSubject} 
                  onValueChange={setSelectedSubject}
                  disabled={!selectedDivision}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {getSubjects().map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
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
                  disabled={!file || !selectedDivision || !selectedSubject || loading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {loading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>Upload an Excel file containing student results with the following columns:</p>
                <ul className="list-disc list-inside mt-2">
                  <li>roll_number (Student Roll Number)</li>
                  <li>ut1 (Unit Test 1 marks, max 25)</li>
                  <li>ut2 (Unit Test 2 marks, max 25)</li>
                  <li>mid_term (Mid Term marks, max 50)</li>
                  <li>annual (Annual Exam marks, max 100)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}