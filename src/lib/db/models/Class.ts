import mongoose from 'mongoose';

const ClassSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  divisions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Division'
  }
}); 