'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload } from 'lucide-react'
import { api } from '@/lib/services/api'

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

export default function StudentsPage() {
  const [file, setFile] = useState<File | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const data = await api.getStudents()
      setStudents(data)
    } catch (error) {
      console.error('Failed to fetch students:', error)
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Students Management</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Students Data</CardTitle>
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
              Upload an Excel file containing student details: Name, Mother's Name, Class, Division, Roll Number
            </div>
          </div>
        </CardContent>
      </Card>

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
                  <th className="py-3 px-4 text-left">Actions</th>
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
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm">Edit</Button>
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