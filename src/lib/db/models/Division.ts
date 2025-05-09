import mongoose from "mongoose";
import Subject from "./Subject";

const DivisionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    class_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
      index: true,
    },
    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        default: [],
        index: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Division =
  mongoose.models.Division || mongoose.model("Division", DivisionSchema);
export default Division;
