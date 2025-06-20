import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRouter from "./routes/authRoute.js";
import titleRouter from "./routes/titleRoute.js";
import titleDataRouter from "./routes/titleDataRoute.js";
import statsRouter from "./routes/statsRoute.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use("/api/auth", authRouter);
app.use("/api/title", titleRouter);
app.use("/api/titledata", titleDataRouter);
app.use("/api/stats", statsRouter);

app.listen((PORT), () => {
    console.log(`Server running on http://localhost:${PORT}.`);
    console.log("Auth routes loaded at /api/auth.");
    console.log("Title routes loaded at /api/title.");
    console.log("Title data routes loaded at /api/titledata.");
    console.log("Stats routes loaded at /api/stats.");
});