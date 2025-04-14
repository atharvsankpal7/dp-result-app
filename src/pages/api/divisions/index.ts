import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/db/connect';
import Division from '@/lib/db/models/Division';
import Class from '@/lib/db/models/Class';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  switch (req.method) {
    case 'GET':
      try {
        const divisions = await Division.find({})
          .populate('class_id')
          .populate('subjects');
        res.status(200).json(divisions);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch divisions' });
      }
      break;

    case 'POST':
      try {
        const division = await Division.create(req.body);
        // Update the corresponding class
        await Class.findByIdAndUpdate(
          division.class_id,
          { $push: { divisions: division._id } }
        );
        res.status(201).json(division);
      } catch (error) {
        res.status(500).json({ error: 'Failed to create division' });
      }
      break;

    default:
      res.status(405).json({ error: 'Method not allowed' });
  }
} 