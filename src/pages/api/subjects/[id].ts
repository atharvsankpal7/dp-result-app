import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/db/connect';
import Subject from '@/lib/db/models/Subject';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();
  const { id } = req.query;

  switch (req.method) {
    case 'GET':
      try {
        const subject = await Subject.findById(id);
        if (!subject) {
          return res.status(404).json({ error: 'Subject not found' });
        }
        res.status(200).json(subject);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch subject' });
      }
      break;

    case 'PUT':
      try {
        const subject = await Subject.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true
        });
        if (!subject) {
          return res.status(404).json({ error: 'Subject not found' });
        }
        res.status(200).json(subject);
      } catch (error) {
        res.status(500).json({ error: 'Failed to update subject' });
      }
      break;

    case 'DELETE':
      try {
        const subject = await Subject.findByIdAndDelete(id);
        if (!subject) {
          return res.status(404).json({ error: 'Subject not found' });
        }
        res.status(200).json({ message: 'Subject deleted successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to delete subject' });
      }
      break;

    default:
      res.status(405).json({ error: 'Method not allowed' });
  }
} 