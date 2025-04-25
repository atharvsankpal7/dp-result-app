'use client'

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Upload } from 'lucide-react';
import { api } from '@/lib/services/api';
import toast from 'react-hot-toast';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

const singleResultSchema = z.object({
  roll_number: z.string().min(1, "Roll number is required"),
  ut1: z.coerce.number().min(0).max(25, "UT1 marks must be between 0 and 25"),
  ut2: z.coerce.number().min(0).max(25, "UT2 marks must be between 0 and 25"),
  terminal: z.coerce.number().min(0).max(50, "terminal marks must be between 0 and 50"),
  annual_theory: z.coerce.number().min(0).max(70, "Annual theory marks must be between 0 and 70"),
  annual_practical: z.coerce.number().min(0).max(30, "Annual practical marks must be between 0 and 30"),
});

// Define the type from the schema
type ResultFormValues = z.infer<typeof singleResultSchema>;

export default function UploadResults() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<ResultFormValues>({
    resolver: zodResolver(singleResultSchema),
    defaultValues: {
      roll_number: "",
      ut1: 0,
      ut2: 0,
      terminal: 0,
      annual_theory: 0,
      annual_practical: 0,
    },
  });

  React.useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const data = await api.getClasses();
      setClasses(data);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      toast.error('Failed to fetch classes');
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

  const onSubmitSingleResult = async (values: ResultFormValues) => {
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
                    disabled={!selectedClass}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Division" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedClass && classes
                        .find((c: any) => c._id === selectedClass)
                        ?.divisions.map((division: any) => (
                          <SelectItem key={division._id} value={division._id}>
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
                      {selectedDivision && classes
                        .find((c: any) => c._id === selectedClass)
                        ?.divisions
                        .find((d: any) => d._id === selectedDivision)
                        ?.subjects.map((subject: any) => (
                          <SelectItem key={subject._id} value={subject._id}>
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

                <FormField
                  control={form.control}
                  name="terminal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Terminal Marks (out of 50)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="annual_theory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Annual Theory (out of 70)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="annual_practical"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Annual Practical (out of 30)</FormLabel>
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
                  disabled={!selectedClass}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Division" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedClass && classes
                      .find((c: any) => c._id === selectedClass)
                      ?.divisions.map((division: any) => (
                        <SelectItem key={division._id} value={division._id}>
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
                    {selectedDivision && classes
                      .find((c: any) => c._id === selectedClass)
                      ?.divisions
                      .find((d: any) => d._id === selectedDivision)
                      ?.subjects.map((subject: any) => (
                        <SelectItem key={subject._id} value={subject._id}>
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
                  <li>terminal (Mid Term marks, max 50)</li>
                  <li>annual_theory (Annual Theory marks)</li>
                  <li>annual_practical (Annual Practical marks)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}