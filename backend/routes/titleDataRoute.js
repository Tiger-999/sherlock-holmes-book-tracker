import express from "express";
import pool from "../db/index.js";

const router = express.Router();

router.get("/", async (req, res) => {

    try {
        const result = await pool.query("SELECT * FROM books ORDER BY title ASC");
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching title data", err);
        res.status(500).json({error: "Internal server error."});
    }
});

export default router;