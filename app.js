import express from "express";
import { connectDB } from "./config/db.js";

const app = express();
const PORT = 3000;

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send("Serwer rodowodów koni arabskich działa poprawnie!");
});

app.listen(PORT, () => console.log(`Uruchomiono serwer na porcie ${PORT}`));