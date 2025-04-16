import mongoose, { CallbackError, Model } from "mongoose";
import bcrypt from "bcryptjs";

interface IStaff {
  email: string;
  password: string;
  role: "admin" | "teacher";
  name: string;
  assigned_subjects: Array<{
    subject_id: mongoose.Types.ObjectId;
    division_id: mongoose.Types.ObjectId;
  }>;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

interface StaffModel extends Model<IStaff> {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const StaffSchema = new mongoose.Schema<IStaff>({
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ["admin", "teacher"], default: "teacher" },
  name: { type: String, required: true },

});

// Hash the password before saving to the database
StaffSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    next();
  } catch (err: CallbackError | any) {
    next(err);
  }
});

StaffSchema.methods.comparePassword = async function(this: IStaff, candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

const Staff = (mongoose.models.Staff as StaffModel) || mongoose.model<IStaff, StaffModel>("Staff", StaffSchema);

export default Staff;