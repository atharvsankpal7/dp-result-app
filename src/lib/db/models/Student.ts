import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const StudentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  mother_name: {
    type: String,
    required: true,
    trim: true
  },
  roll_number: {
    type: String,
    required: true,
    trim: true,
    index: true,
    unique: true
  },
  division_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Division',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Admission Cancelled'],
    default: 'Active'
  },
  mobile_number: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    select: false
  },
  otp: {
    code: { type: String, select: false },
    expiresAt: { type: Date, select: false }
  }
}, {
  timestamps: true
});

// Hash the password before saving to the database
StudentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    if (this.password) {
      const hash = await bcrypt.hash(this.password, 10);
      this.password = hash;
    }
    next();
  } catch (err: any) {
    next(err);
  }
});

StudentSchema.methods.comparePassword = async function (candidatePassword: string) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

const Student = mongoose.models.Student || mongoose.model('Student', StudentSchema);
export default Student;