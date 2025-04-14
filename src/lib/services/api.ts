const BASE_URL = '/api';

export const api = {
  // Subjects
  async getSubjects() {
    const res = await fetch(`${BASE_URL}/subjects`);
    if (!res.ok) throw new Error('Failed to fetch subjects');
    return res.json();
  },

  async createSubject(data: any) {
    const res = await fetch(`${BASE_URL}/subjects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create subject');
    return res.json();
  },

  async updateSubject(id: string, data: any) {
    const res = await fetch(`${BASE_URL}/subjects/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update subject');
  },

  // Classes
  async getClasses() {
    const res = await fetch(`${BASE_URL}/classes`);
    if (!res.ok) throw new Error('Failed to fetch classes');
    return res.json();
  },

  async createClass(data: any) {
    const res = await fetch(`${BASE_URL}/classes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create class');
    return res.json();
  },

  // Divisions
  async createDivision(data: any) {
    const res = await fetch(`${BASE_URL}/divisions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create division');
    return res.json();
  },

  // Students
  async uploadStudents(data: any[]) {
    const res = await fetch(`${BASE_URL}/students/bulk-upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ students: data }),
    });
    if (!res.ok) throw new Error('Failed to upload students');
    return res.json();
  },

  // Teachers
  async assignSubjectsToTeacher(teacherId: string, assignments: any[]) {
    const res = await fetch(`${BASE_URL}/teachers/${teacherId}/assign-subjects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignments }),
    });
    if (!res.ok) throw new Error('Failed to assign subjects');
    return res.json();
  },

  // Excel Upload Helper
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