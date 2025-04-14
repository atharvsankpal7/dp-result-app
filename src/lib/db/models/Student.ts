import mongoose from 'mongoose';

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
    trim: true
  },
  division_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Division',
    required: true
  }
}, {
  timestamps: true
});

const Student = mongoose.models.Student || mongoose.model('Student', StudentSchema);
export default Student; 