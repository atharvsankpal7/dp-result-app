'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

const formSchema = z.object({
  roll_number: z.string().min(1, { message: "Roll number is required" }),
  mother_name: z.string().min(1, { message: "Mother's name is required" }),
})

interface Result {
  subject_id: {
    name: string;
    course_code: string;
  };
  ut1: number;
  ut2: number;
  mid_term: number;
  annual: number;
  total: number;
  remark: 'Pass' | 'Fail';
}

export default function StudentResult() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [studentName, setStudentName] = useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roll_number: "",
      mother_name: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    setError('');
    setResults([]);
    setStudentName('');

    try {
      const response = await fetch('/api/students/result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const data = await response.json();
      setResults(data.results);
      setStudentName(data.student_name);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch results');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Student Result Portal</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="roll_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Roll Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your roll number" {...field} />
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
                          <Input placeholder="Enter your mother's name" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Loading...' : 'View Result'}
                </Button>

                {error && (
                  <div className="text-red-600 text-center">{error}</div>
                )}
              </form>
            </Form>

            {results.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Result for {studentName}</h2>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="py-3 px-4 text-left">Sr.No</th>
                        <th className="py-3 px-4 text-left">Subject Name</th>
                        <th className="py-3 px-4 text-left">Subject Code</th>
                        <th className="py-3 px-4 text-left">UT-1</th>
                        <th className="py-3 px-4 text-left">UT-2</th>
                        <th className="py-3 px-4 text-left">Mid-Term</th>
                        <th className="py-3 px-4 text-left">Annual</th>
                        <th className="py-3 px-4 text-left">Total</th>
                        <th className="py-3 px-4 text-left">Remark</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((result, index) => (
                        <tr key={index} className="border-t">
                          <td className="py-3 px-4">{index + 1}</td>
                          <td className="py-3 px-4">{result.subject_id.name}</td>
                          <td className="py-3 px-4">{result.subject_id.course_code}</td>
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
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}