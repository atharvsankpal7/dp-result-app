import * as XLSX from 'xlsx';

const BASE_URL = '/api';

export const api = {
  // Classes
  async getClasses() {
    const res = await fetch(`${BASE_URL}/classes`);
    if (!res.ok) throw new Error('Failed to fetch classes');
    return res.json();
  },

  async createClass(data: { name: string }) {
    const res = await fetch(`${BASE_URL}/classes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create class');
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
  async createDivision(data: { name: string; class_id: string }) {
    const res = await fetch(`${BASE_URL}/divisions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create division');
    return res.json();
  },

  async deleteDivision(id: string) {
    const res = await fetch(`${BASE_URL}/divisions/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete division');
    return res.json();
  },

  // Students
  async getStudents() {
    const res = await fetch(`${BASE_URL}/students`);
    if (!res.ok) throw new Error('Failed to fetch students');
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

  // Results
  async getResults(classId: string, divisionId: string, subjectId: string) {
    const res = await fetch(
      `${BASE_URL}/results?class=${classId}&division=${divisionId}&subject=${subjectId}`
    );
    if (!res.ok) throw new Error('Failed to fetch results');
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