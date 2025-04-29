import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useState } from "react";

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

interface SingleResultFormProps {
  form: any;
  classes: ClassData[];
  onSubmitSingleResult: (values: any) => void;
  loading: boolean;
}

export const SingleResultForm: React.FC<SingleResultFormProps> = ({
  form,
  classes,
  onSubmitSingleResult,
  loading
}) => {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedDivision, setSelectedDivision] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const selectedClassData = classes.find((c) => c._id === selectedClass);
  const selectedDivisionData = selectedClassData?.divisions.find((d) => d._id === selectedDivision);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Single Result</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmitSingleResult)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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

            <FormField
              control={form.control}
              name="roll_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Roll Number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ut1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>UT-1 Marks (out of 25)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ut2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>UT-2 Marks (out of 25)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="terminal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Terminal Marks (out of 50)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="annual_theory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Annual Theory</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="annual_practical"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Annual Practical</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !selectedDivision || !selectedSubject}
              className="w-full"
            >
              Add Result
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
