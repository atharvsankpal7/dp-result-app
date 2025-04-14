🔐 User Roles

Admin
Teacher
Student
---
📚 Data Models

Student
id
name
mother_name
class
division
roll_number
division_id (FK)
Teacher
id
name
email
assigned_subjects: [ { subject_id, division_id } ]
Class
id
name (e.g. "11th")
Division
id
name (e.g., "A", "B")
class_id (FK)
subjects: [subject_id]
Subject
id
name
course_code
Result
id
student_id (FK)
subject_id (FK)
ut1 (out of 25)
ut2 (out of 25)
mid_term (out of 50)
annual (out of 100)
total (calculated: (ut1 + ut2 + mid + annual) / 2)
remark (Pass/Fail)
---
📤 Teacher Functionality

Select class → division from dropdown.
Upload Excel file with:
roll_no, ut1, ut2, mid_term, annual
System maps roll_no to student and saves result with foreign keys.
---
📥 Student Functionality

Enter roll_no and mother_name.

View result table for all subjects in their division:

Sr.No | Subject Name | Subject Code | UT-1 | UT-2 | Mid-Term | Annual | Total | Remark

---
🛠 Admin Functionality

Class & Division Management:
Add/Remove class & division
Student & Teacher Management:
Upload Excel to add students/teachers
Edit/Delete existing entries
Subject Management:
Add new subject (name + code)
Assign subjects to multiple divisions
for this app currently start with the frontend for the admin dashboard and all the frontend components and pages and utilitites