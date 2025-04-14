'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Plus } from 'lucide-react'
import { api } from '@/lib/services/api'
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

interface Student {
  _id: string;
  name: string;
  mother_name: string;
  roll_number: string;
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
})

export default function StudentsPage() {
  const [file, setFile] = useState<File | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [selectedClass, setSelectedClass] = useState('')
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      mother_name: "",
      roll_number: "",
      division_id: "",
    },
  })

  useEffect(() => {
    fetchStudents()
    fetchClasses()
  }, [])

  const fetchStudents = async () => {
    try {
      const data = await api.getStudents()
      setStudents(data)
    } catch (error) {
      console.error('Failed to fetch students:', error)
    }
  }

  const fetchClasses = async () => {
    try {
      const data = await api.getClasses()
      setClasses(data)
    } catch (error) {
      console.error('Failed to fetch classes:', error)
    }
  }

  const handleFileUpload = async () => {
    if (!file) return
    setLoading(true)
    try {
      await api.uploadStudents(file)
      setFile(null)
      await fetchStudents()
    } catch (error) {
      console.error('Failed to upload students:', error)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true)
    try {
      await api.createStudent(values)
      form.reset()
      await fetchStudents()
    } catch (error) {
      console.error('Failed to add student:', error)
    } finally {
      setLoading(false)
    }
  }

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
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Student name" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="mother_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mother's Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Mother's name" {...field} />
                      </FormControl>
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
                            {selectedClass && classes
                              .find(c => c._id === selectedClass)
                              ?.divisions.map((division) => (
                                <SelectItem key={division._id} value={division._id}>
                                  {division.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
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
                  {loading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                Upload an Excel file containing student details: Name, Mother's Name, Roll Number, Division ID
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
                  <th className="py-3 px-4 text-left">Mother's Name</th>
                  <th className="py-3 px-4 text-left">Class</th>
                  <th className="py-3 px-4 text-left">Division</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id} className="border-t">
                    <td className="py-3 px-4">{student.roll_number}</td>
                    <td className="py-3 px-4">{student.name}</td>
                    <td className="py-3 px-4">{student.mother_name}</td>
                    <td className="py-3 px-4">{student.division_id.class_id.name}</td>
                    <td className="py-3 px-4">{student.division_id.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}