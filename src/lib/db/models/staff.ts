import mongoose, { CallbackError, Model } from "mongoose";
import bcrypt from "bcryptjs";

interface IStaff {
  email: string;
  password: string;
  role: "admin" | "teacher";
  name: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

interface StaffModel extends Model<IStaff> {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const StaffSchema = new mongoose.Schema<IStaff>({
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ["admin", "teacher"] },
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
  console.log(this);
  return bcrypt.compare(candidatePassword, this.password);
};
// Check if the model exists before creating a new one
const Staff = (mongoose.models.Staff as StaffModel) || mongoose.model<IStaff, StaffModel>("Staff", StaffSchema);

export default Staff;