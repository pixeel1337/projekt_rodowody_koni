import mongoose from "mongoose";

const breeederSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Nazwa hodowcy jest wymagana"],
        trim: true
    },
    country: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Country",
        required: [true, "Kraj pochodzenia hodowcy jest wymagany"]
    },
    notes: {
        type: String,
        required: false,
    }
});

breeederSchema.index({name: 1, country: 1}, {unique: true});

export const Breeder = mongoose.model("Breeder", breeederSchema);