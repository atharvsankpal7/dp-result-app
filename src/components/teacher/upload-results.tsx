"use client";

import React from "react";
import { EditableResultsTable } from "./editable-results-table";

export default function TeacherUploadResults() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Upload Results</h1>
      <EditableResultsTable />
    </div>
  );
}