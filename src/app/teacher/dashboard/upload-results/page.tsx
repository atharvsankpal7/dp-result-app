'use client'

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Upload } from 'lucide-react';
import { api } from '@/lib/services/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

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

export default function UploadResults() {
  const { user, loading } = useAuth();
  const [assignedSubjects, setAssignedSubjects] = useState<AssignedSubject[]>([]);
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loadingstate, setLoading] = useState(false);

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
      const result = await api.uploadResults(file, selectedDivision, selectedSubject);
      
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

  const getDivisions = () => {
    const divisions = new Map();
    assignedSubjects.forEach(assignment => {
      const division = assignment.division_id;
      divisions.set(division._id, {
        id: division._id,
        name: `${division.class_id.name} - ${division.name}`,
      });
    });
    return Array.from(divisions.values());
  };

  const getSubjectsForDivision = (divisionId: string) => {
    return assignedSubjects
      .filter(assignment => assignment.division_id._id === divisionId)
      .map(assignment => assignment.subject_id);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Upload Results</h1>

      <Card>
        <CardHeader>
          <CardTitle>Upload Result Sheet</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select value={selectedDivision} onValueChange={setSelectedDivision}>
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
                  {selectedDivision && getSubjectsForDivision(selectedDivision).map((subject) => (
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
                <li>mid_term (Mid Term marks, max 50)</li>
                <li>annual (Annual Exam marks, max 100)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}