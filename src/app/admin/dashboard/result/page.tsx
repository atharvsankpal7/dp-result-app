'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from '@/lib/services/api'

interface Result {
  _id: string;
  student_id: {
    _id: string;
    name: string;
    roll_number: string;
  };
  subject_id: {
    _id: string;
    name: string;
  };
  ut1: number;
  ut2: number;
  mid_term: number;
  annual: number;
  total: number;
  remark: 'Pass' | 'Fail';
}

export default function ResultPage() {
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedDivision, setSelectedDivision] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [results, setResults] = useState<Result[]>([])

  useEffect(() => {
    fetchClasses()
  }, [])

  useEffect(() => {
    if (selectedClass && selectedDivision && selectedSubject) {
      fetchResults()
    }
  }, [selectedClass, selectedDivision, selectedSubject])

  const fetchClasses = async () => {
    try {
      const data = await api.getClasses()
      setClasses(data)
    } catch (error) {
      console.error('Failed to fetch classes:', error)
    }
  }

  const fetchResults = async () => {
    try {
      const data = await api.getResults(selectedClass, selectedDivision, selectedSubject)
      setResults(data)
    } catch (error) {
      console.error('Failed to fetch results:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Results Management</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>View Results</CardTitle>
        </CardHeader>
        <CardContent>
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

            <Select value={selectedDivision} onValueChange={setSelectedDivision}>
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

            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
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

          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="py-3 px-4 text-left">Roll No</th>
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">UT-1</th>
                  <th className="py-3 px-4 text-left">UT-2</th>
                  <th className="py-3 px-4 text-left">Mid-Term</th>
                  <th className="py-3 px-4 text-left">Annual</th>
                  <th className="py-3 px-4 text-left">Total</th>
                  <th className="py-3 px-4 text-left">Remark</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result._id} className="border-t">
                    <td className="py-3 px-4">{result.student_id.roll_number}</td>
                    <td className="py-3 px-4">{result.student_id.name}</td>
                    <td className="py-3 px-4">{result.ut1}</td>
                    <td className="py-3 px-4">{result.ut2}</td>
                    <td className="py-3 px-4">{result.mid_term}</td>
                    <td className="py-3 px-4">{result.annual}</td>
                    <td className="py-3 px-4">{result.total}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        result.remark === 'Pass' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {result.remark}
                      </span>
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