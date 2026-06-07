import express from "express";
import session from "./config/passport.js";
import { Admin } from "./models/Admin.js";
import { connectDB } from "./config/db.js";
import countryRouter from "./routes/countries.js";
import breederRouter from "./routes/breeders.js";
import horseRouter from "./routes/horses.js";
import viewRouter from "./routes/viewRoutes.js";
import authRouter from "./routes/auth.js";
import passport from "./config/passport.js";
import "dotenv/config";


const app = express();
const PORT = 3000;

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.set("view engine", "ejs");
app.set("views", "./views");
app.use("/api/countries", countryRouter);
app.use("/api/breeders", breederRouter);
app.use("/api/horses", horseRouter);
app.use("/api/auth", authRouter);
app.use("/", viewRouter);


app.get("/", (req, res) => {
    res.send("Serwer rodowodów koni arabskich działa poprawnie!");
});

app.listen(PORT, () => console.log(`Uruchomiono serwer na porcie ${PORT}`));