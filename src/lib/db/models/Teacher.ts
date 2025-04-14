import mongoose from 'mongoose';

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

const Teacher = mongoose.models.Teacher || mongoose.model('Teacher', TeacherSchema);
export default Teacher; 