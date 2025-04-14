import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/db/connect';
import Class from '@/lib/db/models/Class';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  switch (req.method) {
    case 'GET':
      try {
        const classes = await Class.find({}).populate('divisions');
        res.status(200).json(classes);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch classes' });
      }
      break;

    case 'POST':
      try {
        const class_ = await Class.create(req.body);
        res.status(201).json(class_);
      } catch (error) {
        res.status(500).json({ error: 'Failed to create class' });
      }
      break;

    default:
      res.status(405).json({ error: 'Method not allowed' });
  }
} 