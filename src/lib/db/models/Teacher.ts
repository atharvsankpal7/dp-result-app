import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const TeacherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  assigned_subjects: [{
    subject_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject'
    },
    division_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Division'
    }
  }]
}, {
  timestamps: true
});

// Hash password before saving
TeacherSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
TeacherSchema.methods.comparePassword = async function(candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

const Teacher = mongoose.models.Teacher || mongoose.model('Teacher', TeacherSchema);
export default Teacher;