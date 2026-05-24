import mongoose from "mongoose";

const countrySchema = mongoose.Schema({
    code: {
        type: String,
        required: [true, "Kod ISO kraju jest wymagany!"],
        unique: true,
        trim: true,
        uppercase: true,
        minLength: 2,
        maxLength: 2
    },
    name: {
        type: String,
        required: [true, "Pełna nazwa kraju jest wymagana!"],
        trim: true
    }
});

export const Country = mongoose.model("Country", countrySchema);