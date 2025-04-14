import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/db/connect';
import Student from '@/lib/db/models/Student';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  switch (req.method) {
    case 'GET':
      try {
        const students = await Student.find({})
          .populate('division_id');
        res.status(200).json(students);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch students' });
      }
      break;

    case 'POST':
      try {
        const student = await Student.create(req.body);
        res.status(201).json(student);
      } catch (error) {
        res.status(500).json({ error: 'Failed to create student' });
      }
      break;

    default:
      res.status(405).json({ error: 'Method not allowed' });
  }
} 