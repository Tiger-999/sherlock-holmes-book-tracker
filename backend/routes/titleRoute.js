import express from "express";
import authenticateToken from "../middleware/authMiddleware.js";
import pool from "../db/index.js";

const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {

    try {
        const userId = req.user.id;

        // const result = await pool.query("SELECT * FROM user_books WHERE user_id = $1 ORDER BY id ASC", [userId]);
        const result = await pool.query(`SELECT ub.id, ub.user_id, ub.read, ub.rating, ub.created_at,
                                         b.title, b.collection, b.type
                                         FROM user_books AS ub
                                         JOIN books AS b ON LOWER(ub.title) = LOWER(b.title)
                                         WHERE ub.user_id = $1
                                         ORDER BY ub.id DESC
                                         `, [userId]);

        res.json(result.rows);

    } catch (err) {
        console.error("GET error:", err);
        res.status(500).json({error: "Internal server error."});
    }
});

router.post("/", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const {title, read, rating} = req.body;

        if (typeof title !== "string" || !title?.trim()) {
            return res.status(400).json({error: "Invalid title."});
        }

        if (typeof read !== "boolean") {
            return res.status(400).json({error: "Invalid read."});
        }

        if (typeof rating !== "number") {
            return res.status(400).json({error: "Invalid rating."});
        }

        const checkTitle = await pool.query("SELECT * FROM user_books WHERE user_id = $1 AND title = $2", [userId, title]);
        if (checkTitle.rows.length > 0) {
            return res.status(400).json({error: "This title already exists in your list."});
        }

        const typeResult = await pool.query("SELECT type from books WHERE title = $1", [title]);

        if (typeResult.rows.length === 0) {
            return res.status(400).json({error: "Title not found in the master table."});
        }

        const type = typeResult.rows[0].type;

        const result = await pool.query("INSERT INTO user_books (title, read, user_id, rating, type) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [title, read, userId, rating, type]);
        res.status(201).json(result.rows[0]);

    } catch (err) {
        console.error("POST error:", err);
        res.status(500).json({error: "Internal server error."});
    }
});

router.delete("/:id", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const titleId = req.params.id;

        const result = await pool.query("DELETE FROM user_books WHERE user_id = $1 AND id = $2", [userId, titleId]);

        if (result.rowCount === 0) {
            return res.status(404).json({error: "Title not found"});
        }
        res.sendStatus(204);

    } catch (err) {
        console.error("DELETE error:", err);
        res.status(500).json({error: "Internal server error."});
    }
});

router.put("/:id", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const titleId = req.params.id;
        const {title, read, rating} = req.body;

        if (typeof title !== "string" || !title?.trim()) {
            return res.status(400).json({error: "Invalid title."});
        }

        if (typeof read !== "boolean") {
            return res.status(400).json({error: "Invalid read."});
        }

        if (typeof rating !== "number" || rating < 1 || rating > 10) {
            return res.status(400).json({error: "Rating must be a number between 1 and 10."});
        }

        const checkDuplicate = await pool.query("SELECT * FROM user_books WHERE user_id = $1 AND title = $2 AND id !=$3",
            [userId, title.trim(), titleId]);
        if (checkDuplicate.rows.length > 0) {
            return res.status(400).json({error: "This title already exists in your list."});
        }

        const typeResult = await pool.query("SELECT type from books WHERE title = $1", [title]);

        if (typeResult.rows.length === 0) {
            return res.status(400).json({error: "Title not found in the master table."});
        }

        const type = typeResult.rows[0].type;

        const result = await pool.query("UPDATE user_books SET title = $1, read = $2, rating = $3, updated_at = CURRENT_TIMESTAMP, type = $4 WHERE user_id = $5 AND id = $6 RETURNING *",
            [title, read, rating, type, userId, titleId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({error: "Title not found."});
        }

        res.json(result.rows[0]);

    } catch (err) {
        console.error("PUT error:", err);
        res.status(500).json({error: "Internal server error."});
    }
});

router.patch("/:id", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const titleId = req.params.id;
        const fields = req.body;

        const allowedField = ["title", "read", "rating"];
        const updateQuery = [];
        const updateParameter = [];
        
        let paramIndex = 1;
        let type = null;

        for (let key of allowedField) {

            if (fields[key] !== undefined) {

                if (key === "title") {
                    if (typeof fields[key] !== "string" || !fields[key]?.trim()) {
                        return res.status(400).json({error: "Invalid title."});
                    }

                    const checkDuplicate = await pool.query("SELECT * FROM user_books WHERE user_id = $1 AND title = $2 AND id != $3",
                        [userId, fields[key].trim(), titleId]);
                    if (checkDuplicate.rows.length > 0) {
                        return res.status(400).json({error: "This title already exists in your list."});
                    }

                    const typeResult = await pool.query("SELECT type FROM books WHERE title = $1", fields["title"].trim());

                    if (typeResult.rows.length === 0) {
                        return res.status(400).json({error: "Title not found in the master table."});
                    }

                    type = typeResult.rows[0].type;

                    fields[key] = fields[key].trim();
                }

                if (key === "read") {
                    if (typeof fields[key] !== "boolean") {
                        return res.status(400).json({error: "Invalid read."});
                    }
                }

                if (key === "rating") {
                    if (typeof fields[key] !== "number" || fields[key] < 1 || fields[key] > 10) {
                        return res.status(400).json({error: "Rating must be a number between 1 and 10."});
                    }
                }

                updateQuery.push(`${key}=$${paramIndex}`);
                updateParameter.push(fields[key]);
                paramIndex++;
            }                
        }

        if (updateQuery.length === 0) {
            return res.status(400).json({error: "No fields to update."});
        }

        updateQuery.push("updated_at = CURRENT_TIMESTAMP");

        if (type !== null) {
            updateQuery.push(`type = $${paramIndex}`);
            updateParameter.push(type);
            paramIndex++;
        }

        updateParameter.push(userId);
        updateParameter.push(titleId)

        const result = await pool.query(`UPDATE user_books SET ${updateQuery.join(", ")} WHERE user_id=$${paramIndex} 
            AND id = $${paramIndex + 1} RETURNING *`, updateParameter);

        if (result.rows.length === 0) {
            return res.status(404).json({error: "Title not found."});
        }
        res.json(result.rows[0]);

    } catch (err) {
        console.error("PATCH error:", err);
        res.status(500).json({error: "Internal server error."});
    }
});

router.post("/titleData", authenticateToken, async (req, res) => {

    try {
        const {title} = req.body;

        if (!title?.trim()) {
            return res.status(400).json({error: "Title is required."});
        }

        const bookData = await pool.query("SELECT * FROM books WHERE title = $1", [title]);

        if (bookData.rows.length === 0) {
            return res.status(404).json({error: "Book not found."});
        }
        return res.json({message: "Book data found.", data: bookData.rows[0] || null});

    } catch (err) {
        console.error(err);
        return res.status(500).json({error: "Internal server error."});
    }
});

export default router;