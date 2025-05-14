import Staff from './models/staff';
import connectDB from './connect';

export const seedAdmin = async () => {
  try {
    await connectDB();
    
    // Check if admin already exists
    const existingAdmin = await Staff.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    await Staff.create({
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      name: 'Admin User'
    });

    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error seeding admin:', error);
  }
};