import mongoose from 'mongoose';

const DivisionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  class_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }]
}, {
  timestamps: true
});

const Division = mongoose.models.Division || mongoose.model('Division', DivisionSchema);
export default Division; 