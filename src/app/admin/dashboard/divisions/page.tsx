'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Trash } from 'lucide-react'
import { api } from '@/lib/services/api'

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

export default function DivisionsPage() {
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    try {
      const data = await api.getClasses()
      setClasses(data)
    } catch (error) {
      console.error('Failed to fetch classes:', error)
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
                    ?.divisions.map((division: Division) => (
                      <tr key={division._id} className="border-t">
                        <td className="py-3 px-4">{division.name}</td>
                        <td className="py-3 px-4">
                          {division.class_id?.name}
                        </td>
                        <td className="py-3 px-4">
                          {division.subjects?.map(subject => subject.name).join(', ') || 'No subjects assigned'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
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
    </div>
  )
}