import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/db/connect';
import Teacher from '@/lib/db/models/Teacher';
import Subject from '@/lib/db/models/Subject 