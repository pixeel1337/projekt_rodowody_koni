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


horseSchema.pre("save", async function (next) {
    const horseBirthYear = this.birthYear;

    if(this.father) {
        const fatherHorse = await mongoose.model("Horse").findById(this.father);

        if(!fatherHorse) {
            return next(new Error("Podany ojciec nie istnieje w bazie!"));
        }

        if(fatherHorse.gender !== "ogier") {
            return next(new Error("Ojciec może być wyłącznie ogierem!"));
        }

        const fatherAge = horseBirthYear - fatherHorse.birthYear;
        if(fatherAge < 3 || fatherAge > 21) {
            return next(new Error("Ojciec musi mieć od 3 do 21 lat!"));
        }
    }

    if(this.mother) {
        const motherHorse = await mongoose.model("Horse").findById(this.mother);

        if(!motherHorse) {
            return next(new Error("Podana matka nie istnieje w bazie!"));
        }

        if(motherHorse.gender !== "ogier") {
            return next(new Error("Matka może być wyłącznie klaczą!"));
        }

        const motherAge = horseBirthYear - motherHorse.birthYear;
        if(motherAge < 3 || motherAge > 21) {
            return next(new Error("Matka musi mieć od 3 do 21 lat!"));
        }
    }
        
    next();
});

export const Horse = mongoose.model("Horse", horseSchema);