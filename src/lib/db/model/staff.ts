import mongoose, { CallbackError } from "mongoose";
import bcrypt from "bcryptjs";

const StaffSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ["admin", "teacher"] },
  name: { type: String, required: true }, // Missing name field that's used in seedAdmin.ts
});

// hash the password before saving to the database
StaffSchema.pre("save", async function (next) {
  const staff = this;

  if (!staff.isModified("password")) {
    return next();
  }

  try {
    const hash = await bcrypt.hash(staff.password, 10);
    staff.password = hash;
    next();
  } catch (err: CallbackError | any) {
    next(err);
  }
});

StaffSchema.methods.comparePassword = async function (this, candidatePassword: string) {
  
  return await bcrypt.compare(candidatePassword, this.password);
};

const Staff = mongoose.models.Staff || mongoose.model("Staff", StaffSchema);

export default Staff;