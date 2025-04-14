import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/db/connect';
import Subject from '@/lib/db/models/Subject';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  switch (req.method) {
    case 'GET':
      try {
        const subjects = await Subject.find({});
        res.status(200).json(subjects);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch subjects' });
      }
      break;
    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 