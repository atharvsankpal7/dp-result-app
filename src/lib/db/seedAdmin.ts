import Staff from '@/lib/db/model/staff';
import connectDB from './connect';

export const seedAdmin = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Staff.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const admin = await Staff.create({
      email: 'admin@example.com',
      password: 'admin123', // This will be hashed automatically by the pre-save hook
      role: 'admin',
    });

    console.log('Admin user created successfully:', admin);
  } catch (error) {
    console.error('Error seeding admin:', error);
  }
};

seedAdmin(); 