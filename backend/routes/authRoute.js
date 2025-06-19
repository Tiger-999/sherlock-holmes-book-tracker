import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db/index.js";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "devsecret";
const authRouter = express.Router();

authRouter.post("/register", async (req, res) => {
    try {
        const {username, email, password} = req.body;

        if (!username?.trim() || !email?.trim() || !password?.trim()) {
            return res.status(400).json({error: "All fields are required."});
        }

        const checkExistUsername = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
        if (checkExistUsername.rows.length > 0) {
            return res.status(409).json({error: "This username has already applied. Please try with other username."});
        }
        
        const checkExistEmail = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (checkExistEmail.rows.length > 0) {
            return res.status(409).json({error: "This email has already applied. Please try with other email."});
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        const result = await pool.query("INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
            [username, email, hashedPassword]);
        const user = result.rows[0];
        
        const token = jwt.sign({id: user.id, username: user.username, email: user.email}, JWT_SECRET, {expiresIn: "1d"});
        res.status(201).json({message: "Register successfully.", token, username: user.username});
    } catch (err) {
        console.error("Register error:", err);
        res.status(500).json({error: "Internal server error."});
    }
});

authRouter.post("/login", async (req, res) => {
    try {
        const {email, password} = req.body;

        if (!email?.trim() || !password?.trim()) {
            return res.status(400).json({error: "All fields are required."});
        }

        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({error: "Invalid email or password."});
        }

        const user = result.rows[0];

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({error: "Invalid email or password."});
        }

        const token = jwt.sign({id: user.id, email: user.email, username: user.username}, JWT_SECRET, {expiresIn: "1d"});
        res.status(200).json({message: "Login successfully.", token, username: user.username});

    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({error: "Internal server error."});
    }
});

authRouter.post("/logout", (req, res) => {
    res.json({message: "Logout successful."});
});

export default authRouter;