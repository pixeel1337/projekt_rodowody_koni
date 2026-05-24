import mongoose from "mongoose";

export const connectDB = async () => {
    const url = "mongodb://127.0.0.1:27017/rodowody";

    try {
        await mongoose.connect(url);
        console.log("Połączenie z bazą danych zakończone sukcesem!");

    } catch(err) {
        console.error("Błąd łączenia z bazą danych!");
        process.exit(1);
    }
};