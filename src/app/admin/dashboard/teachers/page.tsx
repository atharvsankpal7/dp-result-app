'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Plus } from 'lucide-react'
import { api } from '@/lib/services/api'
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

interface Teacher {
  _id: string;
  name: string;
  email: string;
  assigned_subjects: {
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
  }[];
}

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
})

export default function TeachersPage() {
  const [file, setFile] = useState<File | null>(null)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  })

  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = async () => {
    try {
      const data = await api.getTeachers()
      setTeachers(data)
    } catch (error) {
      console.error('Failed to fetch teachers:', error)
    }
  }

  const handleFileUpload = async () => {
    if (!file) return
    setLoading(true)
    try {
      await api.uploadTeachers(file)
      setFile(null)
      await fetchTeachers()
    } catch (error) {
      console.error('Failed to upload teachers:', error)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true)
    try {
      await api.createTeacher(values)
      form.reset()
      await fetchTeachers()
    } catch (error) {
      console.error('Failed to add teacher:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Teachers Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Add Single Teacher</CardTitle>
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
                        <Input placeholder="Teacher name" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Email address" type="email" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={loading}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Teacher
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bulk Upload Teachers</CardTitle>
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
                Upload an Excel file containing teacher details: Name, Email
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Teachers List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">Email</th>
                  <th className="py-3 px-4 text-left">Assigned Subjects</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher) => (
                  <tr key={teacher._id} className="border-t">
                    <td className="py-3 px-4">{teacher.name}</td>
                    <td className="py-3 px-4">{teacher.email}</td>
                    <td className="py-3 px-4">
                      {teacher.assigned_subjects.map(assignment => (
                        <div key={`${assignment.subject_id._id}-${assignment.division_id._id}`}>
                          {assignment.subject_id.name} ({assignment.division_id.class_id.name} - {assignment.division_id.name})
                        </div>
                      ))}
                    </td>
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