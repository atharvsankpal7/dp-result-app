import mongoose from 'mongoose';
import './Division';
import './Subject';

const ClassSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  divisions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Division',
    default: []
  }]
}, {
  timestamps: true
});

const Class = mongoose.models.Class || mongoose.model('Class', ClassSchema);
export default Class;