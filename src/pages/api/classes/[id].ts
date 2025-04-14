import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/db/connect';
import Class from '@/lib/db/models/Class';
import Division from '@/lib/db/models/Division';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();
  const { id } = req.query;

  switch (req.method) {
    case 'GET':
      try {
        const class_ = await Class.findById(id).populate('divisions');
        if (!class_) {
          return res.status(404).json({ error: 'Class not found' });
        }
        res.status(200).json(class_);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch class' });
      }
      break;

    case 'PUT':
      try {
        const class_ = await Class.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true
        });
        if (!class_) {
          return res.status(404).json({ error: 'Class not found' });
        }
        res.status(200).json(class_);
      } catch (error) {
        res.status(500).json({ error: 'Failed to update class' });
      }
      break;

    case 'DELETE':
      try {
        // Delete associated divisions first
        await Division.deleteMany({ class_id: id });
        const class_ = await Class.findByIdAndDelete(id);
        if (!class_) {
          return res.status(404).json({ error: 'Class not found' });
        }
        res.status(200).json({ message: 'Class and associated divisions deleted successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to delete class' });
      }
      break;

    default:
      res.status(405).json({ error: 'Method not allowed' });
  }
} 