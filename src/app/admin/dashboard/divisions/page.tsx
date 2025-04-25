'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Edit, Trash } from 'lucide-react'
import { api } from '@/lib/services/api'
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Division {
  _id: string;
  name: string;
  class_id: {
    _id: string;
    name: string;
  };
  subjects: {
    _id: string;
    name: string;
    course_code: string;
  }[];
}

interface Subject {
  _id: string;
  name: string;
  course_code: string;
}

export default function DivisionsPage() {
  // @typescript-eslint/no-explicit-any
  const [classes, setClasses] = useState<any[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedClass, setSelectedClass] = useState('')
  const [loading, setLoading] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(null)
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])

  useEffect(() => {
    fetchClasses()
    fetchSubjects()
  }, [])

  useEffect(() => {
    if (selectedDivision) {
      setSelectedSubjects(selectedDivision.subjects.map(subject => subject?._id))
    }
  }, [selectedDivision])

  const fetchClasses = async () => {
    try {
      const data = await api.getClasses()
      setClasses(data)
      setSelectedClass(data[0]?._id || '')
    } catch (error) {
      console.error('Failed to fetch classes:', error)
    }
  }

  const fetchSubjects = async () => {
    try {
      const data = await api.getSubjects()
      setSubjects(data)
    } catch (error) {
      console.error('Failed to fetch subjects:', error)
    }
  }

  const handleDeleteDivision = async (divisionId: string) => {
    if (!confirm('Are you sure you want to delete this division?')) return
    setLoading(true)
    try {
      await api.deleteDivision(divisionId)
      await fetchClasses()
    } catch (error) {
      console.error('Failed to delete division:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (division: Division) => {
    setSelectedDivision(division)
    setIsEditDialogOpen(true)
  }

  const handleSubjectToggle = (subjectId: string) => {
    setSelectedSubjects(prev => {
      if (prev.includes(subjectId)) {
        return prev.filter(id => id !== subjectId)
      } else {
        return [...prev, subjectId]
      }
    })
  }

  const handleSaveSubjects = async () => {
    if (!selectedDivision) return
    setLoading(true)
    try {
      await api.assignSubjectsToDivision(selectedDivision._id, selectedSubjects)
      await fetchClasses()
      setIsEditDialogOpen(false)
      setSelectedDivision(null)
    } catch (error) {
      console.error('Failed to assign subjects:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Divisions Management</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>View Divisions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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

            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="py-3 px-4 text-left">Division Name</th>
                    <th className="py-3 px-4 text-left">Class</th>
                    <th className="py-3 px-4 text-left">Subjects</th>
                    <th className="py-3 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {classes
                    .find((c: any) => c._id === selectedClass)
                    ?.divisions?.map((division: Division) => (
                      <tr key={division._id} className="border-t">
                        <td className="py-3 px-4">{division.name}</td>
                        <td className="py-3 px-4">
                          {division.class_id?.name}
                        </td>
                        <td className="py-3 px-4">
                          {division.subjects?.map(subject => subject?.name).join(', ') || 'No subjects assigned'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEdit(division)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteDivision(division._id)}
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Subjects to Division</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {subjects.map((subject) => (
                <div key={subject._id} className="flex items-center space-x-2">
                  <Checkbox
                    id={subject._id}
                    checked={selectedSubjects.includes(subject._id)}
                    onCheckedChange={() => handleSubjectToggle(subject._id)}
                  />
                  <label
                    htmlFor={subject._id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {subject.name} ({subject.course_code})
                  </label>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="flex justify-end gap-4 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveSubjects}
              disabled={loading}
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}