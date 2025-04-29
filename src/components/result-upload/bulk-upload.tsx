import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface ClassData {
  _id: string;
  name: string;
  divisions: {
    _id: string;
    name: string;
    subjects: {
      _id: string;
      name: string;
    }[];
  }[];
}

interface BulkUploadFormProps {
  classes: ClassData[];
  selectedClass: string | null;
  setSelectedClass: (value: string) => void;
  selectedDivision: string | null;
  setSelectedDivision: (value: string) => void;
  selectedSubject: string | null;
  setSelectedSubject: (value: string) => void;
  file: File | null;
  setFile: (file: File | null) => void;
  handleFileUpload: () => void;
  loading: boolean;
}

export const BulkUploadForm: React.FC<BulkUploadFormProps> = ({
  classes,
  selectedClass,
  setSelectedClass,
  selectedDivision,
  setSelectedDivision,
  selectedSubject,
  setSelectedSubject,
  file,
  setFile,
  handleFileUpload,
  loading
}) => {
  const selectedClassData = classes.find(c => c._id === selectedClass);
  const selectedDivisionData = selectedClassData?.divisions.find(d => d._id === selectedDivision);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Upload Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedClass ?? ""} onValueChange={setSelectedClass}>
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

            <Select
              value={selectedDivision ?? ""}
              onValueChange={setSelectedDivision}
              disabled={!selectedClass}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Division" />
              </SelectTrigger>
              <SelectContent>
                {selectedClassData?.divisions.map((division) => (
                  <SelectItem key={division._id} value={division._id}>
                    {division.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedSubject ?? ""}
              onValueChange={setSelectedSubject}
              disabled={!selectedDivision}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                {selectedDivisionData?.subjects.map((subject) => (
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
              {loading ? "Uploading..." : "Upload"}
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Upload an Excel file containing student results with the following columns:</p>
            <ul className="list-disc list-inside mt-2">
              <li>roll_number (Student Roll Number)</li>
              <li>ut1 (Unit Test 1 marks, max 25)</li>
              <li>ut2 (Unit Test 2 marks, max 25)</li>
              <li>terminal (Mid Term marks, max 50)</li>
              <li>annual_theory (Annual Theory marks)</li>
              <li>annual_practical (Annual Practical marks)</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
