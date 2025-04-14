import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/db/connect';
import Teacher from '@/lib/db/models/Teacher';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  switch (req.method) {
    case 'GET':
      try {
        const teachers = await Teacher.find({})
          .populate('assigned_subjects.subject_id')
          .populate('assigned_subjects.division_id');
        res.status(200).json(teachers);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch teachers' });
      }
      break;

    case 'POST':
      try {
        const teacher = await Teacher.create(req.body);
        res.status(201).json(teacher);
      } catch (error) {
        res.status(500).json({ error: 'Failed to create teacher' });
      }
      break;

    default:
      res.status(405).json({ error: 'Method not allowed' });
  }
} 