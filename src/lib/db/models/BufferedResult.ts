import mongoose from "mongoose";

const BufferedResultSchema = new mongoose.Schema(
  {
    teacher_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
      index: true,
    },
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    subject_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    ut1: {
      type: Number,
      required: true,
      min: 0,
      max: 25,
    },
    ut2: {
      type: Number,
      required: true,
      min: 0,
      max: 25,
    },
    terminal: {
      type: Number,
      required: true,
      min: 0,
      max: 50,
    },
    annual_practical: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    annual_theory: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    remark: {
      type: String,
      required: true,
      enum: ["Pass", "Fail"],
    },
    status: {
      type: String,
      required: true,
      enum: ["draft", "submitted", "approved"],
      default: "draft",
    },
  },
  {
    timestamps: true,
  }
);

// Calculate total and remark before saving
BufferedResultSchema.pre("save", function (next) {
  this.total =
    (this.ut1 +
      this.ut2 +
      this.terminal +
      this.annual_theory +
      this.annual_practical) /
    2;

  this.remark = this.total >= 35 ? "Pass" : "Fail";

  next();
});

const BufferedResult = mongoose.models.BufferedResult || mongoose.model("BufferedResult", BufferedResultSchema);
export default BufferedResult;