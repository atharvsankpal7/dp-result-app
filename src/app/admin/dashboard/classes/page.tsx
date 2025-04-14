'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit, Trash } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from '@/lib/services/api'

interface Class {
  _id: string;
  name: string;
  divisions: Division[];
}

interface Division {
  _id: string;
  name: string;
  subjects: string[];
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [selectedClass, setSelectedClass] = useState('')
  const [newClassName, setNewClassName] = useState('')
  const [newDivisionName, setNewDivisionName] = useState('')
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

  const handleAddClass = async () => {
    if (!newClassName.trim()) return
    setLoading(true)
    try {
      await api.createClass({ name: newClassName })
      setNewClassName('')
      await fetchClasses()
    } catch (error) {
      console.error('Failed to add class:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddDivision = async () => {
    if (!selectedClass || !newDivisionName.trim()) return
    setLoading(true)
    try {
      await api.createDivision({
        name: newDivisionName,
        class_id: selectedClass
      })
      setNewDivisionName('')
      await fetchClasses()
    } catch (error) {
      console.error('Failed to add division:', error)
    } finally {
      setLoading(false)
    }
  }

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
              <div className="flex items-center gap-4">
                <Input 
                  placeholder="Enter class name (e.g., 10th)" 
                  className="flex-1"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                />
                <Button onClick={handleAddClass} disabled={loading || !newClassName.trim()}>
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
                          {class_.divisions.map(d => d.name).join(', ')}
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

        <Card>
          <CardHeader>
            <CardTitle>Divisions</CardTitle>
          </CardHeader>
          <CardContent>
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

              <div className="flex items-center gap-4">
                <Input 
                  placeholder="Enter division name (e.g., A)" 
                  className="flex-1"
                  value={newDivisionName}
                  onChange={(e) => setNewDivisionName(e.target.value)}
                />
                <Button 
                  onClick={handleAddDivision}
                  disabled={loading || !selectedClass || !newDivisionName.trim()}
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
                    {selectedClass && classes
                      .find(c => c._id === selectedClass)
                      ?.divisions.map((division) => (
                        <tr key={division._id} className="border-t">
                          <td className="py-3 px-4">{division.name}</td>
                          <td className="py-3 px-4">
                            {division.subjects.join(', ')}
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
  )
}