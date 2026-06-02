import mongoose from "mongoose";
import bcrypt from "bcrypt";

const adminSchema = new mongoose.Schema({
    login: {
        type: String,
        required: [true, "Login jest wymagany!"],
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, "Hasło jest wymagane!"]
    }
});

adminSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password  = await bcrypt.hash(this.password, salt);
        next();
    } catch(err) {
        next(err);
    }
})

adminSchema.methods.comparePassword = async function (candidate) {
    return await bcrypt.compare(candidate, this.password);
};


export const Admin = mongoose.model("Admin", adminSchema);