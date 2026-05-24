import mongoose from "mongoose";

const allowedGenders = ["klacz", "ogier", "wałach"];
const allowedOintments = ["siwa", "gniada", "kasztanowata", "kara"];

const horseSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Imie konia jest wymagane!"],
        trim: true
    },
    birthYear: {
        type: Number,
        required: [true, "Rok urodzenia konia jest wymagany!"]
    },
    gender: {
        type: String,
        required: [true, "Płeć konia jest wymagana!"],
        enum: allowedGenders
    },
    ointment: {
        type: String,
        required: [true, "Maść konia jest wymagana!"],
        enum: allowedOintments
    },
    birthCountry: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Country",
        required: [true, "Kraj urodzenia konia jest wymagany!"]
    },
    breeder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Breeder",
        required: [true, "Hodowca konia jest wymagany!"]
    },
    father: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Horse",
            default: null
        },
    mother: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Horse",
        default: null
    },
    notes: {
        type: String,
        required: false
    }
});

horseSchema.index({name: 1, birthCountry: 1, birthYear: 1}, {unique: true});

export const Horse = mongoose.model("Horse", horseSchema);