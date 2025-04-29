
"use client";

import React from "react";
import { TeacherBulkUploadForm } from "./bulk-upload-form";
import { DraftResults } from "./draft-results";

export default function TeacherUploadResults() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Upload Results</h1>
      <DraftResults />
    </div>
  );
}
