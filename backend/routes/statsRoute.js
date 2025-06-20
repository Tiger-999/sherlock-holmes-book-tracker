import express from "express";
import authenticateToken from "../middleware/authMiddleware.js";
import pool from "../db/index.js";

const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
    const userId = req.user.id;

    try {

        const result = await pool.query(`
            SELECT
                COUNT(*) FILTER (WHERE read = true) AS books_read,
                COUNT(*) AS total_books,
                ROUND(AVG(CASE WHEN read = true THEN rating ELSE NULL END)::numeric, 2) AS average_rating,
                COUNT(*) FILTER (WHERE type = 'Novel') AS novels,
                COUNT(*) FILTER (WHERE type = 'Short story') AS short_stories
            FROM user_books
            WHERE user_id = $1
            `, [userId]);

        const recent = await pool.query(`
            SELECT title, type, rating, read, updated_at
            FROM user_books
            WHERE user_id = $1 AND read = true
            ORDER BY updated_at DESC
            LIMIT 5          
            `, [userId]);

            res.json({
                ...result.rows[0],
                recent_reads: recent.rows
            });

    } catch (err) {
        console.error("Stats error:", err);
        res.status(500).json({error: "Failed to fetch stats."});
    }
});

export default router;