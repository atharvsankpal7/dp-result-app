import * as XLSX from 'xlsx';

const BASE_URL = '/api';

export const api = {
  // Classes
  async getClasses() {
    const res = await fetch(`${BASE_URL}/classes`);
    if (!res.ok) throw new Error('Failed to fetch classes');
    return res.json();
  },

  // single class operations
  async createClass(data: { name: string }) {
    const res = await fetch(`${BASE_URL}/classes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create class');
    return res.json();
  },

  async updateClass(id: string, data: { name: string }) {
    const res = await fetch(`${BASE_URL}/classes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update class');
    return res.json();
  },

  async deleteClass(id: string) {
    const res = await fetch(`${BASE_URL}/classes/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete class');
    return res.json();
  },

  // Divisions
  async getDivision(id: string) {
    const res = await fetch(`${BASE_URL}/divisions/${id}`);
    if (!res.ok) throw new Error('Failed to fetch division');
    return res.json();
  },

  async createDivision(data: { name: string; class_id: string }) {
    const res = await fetch(`${BASE_URL}/divisions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create division');
    return res.json();
  },

  async updateDivision(id: string, data: { name?: string; subjects?: string[] }) {
    const res = await fetch(`${BASE_URL}/divisions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update division');
    return res.json();
  },

  async deleteDivision(id: string) {
    const res = await fetch(`${BASE_URL}/divisions/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete division');
    return res.json();
  },

  async assignSubjectsToDivision(divisionId: string, subjects: string[]) {
    const res = await fetch(`${BASE_URL}/divisions/${divisionId}/subjects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subjects }),
    });
    if (!res.ok) throw new Error('Failed to assign subjects');
    return res.json();
  },

  async removeSubjectFromDivision(divisionId: string, subjectId: string) {
    const res = await fetch(`${BASE_URL}/divisions/${divisionId}/subjects`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subjectId }),
    });
    if (!res.ok) throw new Error('Failed to remove subject');
    return res.json();
  },

  // Subjects
  async getSubjects() {
    const res = await fetch(`${BASE_URL}/subjects`);
    if (!res.ok) throw new Error('Failed to fetch subjects');
    return res.json();
  },

  async createSubject(data: { name: string; course_code: string }) {
    const res = await fetch(`${BASE_URL}/subjects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create subject');
    return res.json();
  },

  async updateSubject(id: string, data: { name?: string; course_code?: string }) {
    const res = await fetch(`${BASE_URL}/subjects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update subject');
    return res.json();
  },

  async deleteSubject(id: string) {
    const res = await fetch(`${BASE_URL}/subjects/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete subject');
    return res.json();
  },

  // Students
  async getStudents() {
    const res = await fetch(`${BASE_URL}/students`);
    if (!res.ok) throw new Error('Failed to fetch students');
    return res.json();
  },

  async getStudent(id: string) {
    const res = await fetch(`${BASE_URL}/students/${id}`);
    if (!res.ok) throw new Error('Failed to fetch student');
    return res.json();
  },

  async createStudent(data: {
    name: string;
    mother_name: string;
    roll_number: string;
    division_id: string;
  }) {
    const res = await fetch(`${BASE_URL}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create student');
    return res.json();
  },

  async updateStudent(id: string, data: {
    name?: string;
    mother_name?: string;
    roll_number?: string;
    division_id?: string;
  }) {
    const res = await fetch(`${BASE_URL}/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update student');
    return res.json();
  },

  async deleteStudent(id: string) {
    const res = await fetch(`${BASE_URL}/students/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete student');
    return res.json();
  },

  async uploadStudents(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch(`${BASE_URL}/students/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to upload students');
    return res.json();
  },

  // Teachers
  async getTeachers() {
    const res = await fetch(`${BASE_URL}/teachers`);
    if (!res.ok) throw new Error('Failed to fetch teachers');
    return res.json();
  },

  async getTeacher(id: string) {
    const res = await fetch(`${BASE_URL}/teachers/${id}`);
    if (!res.ok) throw new Error('Failed to fetch teacher');
    return res.json();
  },

  async createTeacher(data: { name: string; email: string; password: string }) {
    const res = await fetch(`${BASE_URL}/teachers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create teacher');
    return res.json();
  },

  async updateTeacher(id: string, data: {
    name?: string;
    email?: string;
    password?: string;
    assigned_subjects?: Array<{ subject_id: string; division_id: string }>;
  }) {
    const res = await fetch(`${BASE_URL}/teachers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update teacher');
    return res.json();
  },

  async deleteTeacher(id: string) {
    const res = await fetch(`${BASE_URL}/teachers/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete teacher');
    return res.json();
  },

  async uploadTeachers(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch(`${BASE_URL}/teachers/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to upload teachers');
    return res.json();
  },

  async assignSubjectsToTeacher(teacherId: string, assignments: Array<{ subject_id: string; division_id: string }>) {
    const res = await fetch(`${BASE_URL}/teachers/${teacherId}/assign-subjects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignments }),
    });
    if (!res.ok) throw new Error('Failed to assign subjects');
    return res.json();
  },

  // Results
  async getResults(classId: string, divisionId: string, subjectId: string) {
    const res = await fetch(
      `${BASE_URL}/results?class=${classId}&division=${divisionId}&subject=${subjectId}`
    );
    if (!res.ok) throw new Error('Failed to fetch results');
    return res.json();
  },

  // Teacher specific methods
  async getAssignedSubjects(teacherId: string) {
    const res = await fetch(`${BASE_URL}/teachers/${teacherId}/assigned-subjects`);
    if (!res.ok) throw new Error('Failed to fetch assigned subjects');
    return res.json();
  },

  async uploadResults(file: File, divisionId: string, subjectId: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('divisionId', divisionId);
    formData.append('subjectId', subjectId);

    const res = await fetch(`${BASE_URL}/results/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to upload results');
    }

    return res.json();
  },

  async getTeacherDashboardStats() {
    const res = await fetch(`${BASE_URL}/teachers/dashboard-stats`);
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
  },

  // Excel Helper
  async parseExcelFile(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsBinaryString(file);
    });
  }
};