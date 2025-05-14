"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Upload } from "lucide-react";
import { api } from "@/lib/services/api";
import toast from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { BulkUploadForm } from "../result-upload/bulk-upload";
import { SingleResultForm } from "../result-upload/single-upload";

const singleResultSchema = z
  .object({
    roll_number: z.string().min(1, "Roll number is required"),
    ut1: z.coerce.number().min(0).max(25, "UT1 marks must be between 0 and 25"),
    ut2: z.coerce.number().min(0).max(25, "UT2 marks must be between 0 and 25"),
    terminal: z.coerce
      .number()
      .min(0)
      .max(50, "terminal marks must be between 0 and 50"),
    annual_theory: z.coerce
      .number()
      .min(0)
      .max(70, "Annual theory marks must be between 0 and 80"),
    annual_practical: z.coerce
      .number()
      .min(0)
      .max(30, "Annual practical marks must be between 0 and 50"),
  })
  .refine((data) => data.annual_theory + data.annual_practical <= 100, {
    message:
      "Total marks for annual theory and practical must be between 0 and 100",
    path: ["annual_practical"], // Path to the error
  });

// Define the type from the schema
type ResultFormValues = z.infer<typeof singleResultSchema>;

export default function UploadResults() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
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
      console.error("Failed to fetch classes:", error);
      toast.error("Failed to fetch classes");
    }
  };

  const handleFileUpload = async () => {
    if (!file || !selectedDivision || !selectedSubject) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("divisionId", selectedDivision);
      formData.append("subjectId", selectedSubject);

      const response = await fetch("/api/results/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload results");
      }

      const result = await response.json();
      toast.success("Results uploaded successfully");

      if (result.errors && result.errors.length > 0) {
        result.errors.forEach((error: string) => toast.error(error));
      }

      setFile(null);
    } catch (error) {
      console.error("Failed to upload results:", error);
      toast.error("Failed to upload results");
    } finally {
      setLoading(false);
    }
  };

  const onSubmitSingleResult = async (values: ResultFormValues) => {
    if (!selectedDivision || !selectedSubject) {
      toast.error("Please select division and subject");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          division_id: selectedDivision,
          subject_id: selectedSubject,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add result");
      }

      toast.success("Result added successfully");
      form.reset();
    } catch (error) {
      console.error("Failed to add result:", error);
      toast.error("Failed to add result");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Upload Results</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SingleResultForm
          form={form}
          classes={classes}
          // selectedClass={selectedClass}
          // setSelectedClass={setSelectedClass}
          // selectedDivision={selectedDivision}
          // setSelectedDivision={setSelectedDivision}
          // selectedSubject={selectedSubject}
          // setSelectedSubject={setSelectedSubject}
          onSubmitSingleResult={onSubmitSingleResult}
          loading={loading}
        />

        <BulkUploadForm
          classes={classes}
          selectedClass={selectedClass}
          setSelectedClass={setSelectedClass}
          selectedDivision={selectedDivision}
          setSelectedDivision={setSelectedDivision}
          selectedSubject={selectedSubject}
          setSelectedSubject={setSelectedSubject}
          file={file}
          setFile={setFile}
          handleFileUpload={handleFileUpload}
          loading={loading}
        />
      </div>
    </div>
  );
}
