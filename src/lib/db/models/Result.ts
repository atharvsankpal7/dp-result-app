import mongoose from "mongoose";

const ResultSchema = new mongoose.Schema(
  {
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
  },
  {
    timestamps: true,
  }
);

// Calculate total and remark before saving
ResultSchema.pre("save", function (next) {
  // Calculate total marks (ut1 + ut2 + terminal + annual_theory + annual_practical) / 2
  this.total =
    (this.ut1 +
      this.ut2 +
      this.terminal +
      this.annual_theory +
      this.annual_practical) /
    2;

  // Set remark based on total marks (assuming passing marks is 35%)
  this.remark = this.total >= 35 ? "Pass" : "Fail";

  next();
});

const Result = mongoose.models.Result || mongoose.model("Result", ResultSchema);
export default Result;
