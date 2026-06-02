import express from "express";
import { connectDB } from "./config/db.js";
import countryRouter from "./routes/countries.js";
import breederRouter from "./routes/breeders.js";
import horseRouter from "./routes/horses.js";

const app = express();
const PORT = 3000;

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("view engine", "ejs");
app.use("views", "./views");
app.use("/api/countries", countryRouter);
app.use("/api/breeders", breederRouter);
app.use("/api/horses", horseRouter);

app.get("/", (req, res) => {
    res.send("Serwer rodowodów koni arabskich działa poprawnie!");
});

app.listen(PORT, () => console.log(`Uruchomiono serwer na porcie ${PORT}`));