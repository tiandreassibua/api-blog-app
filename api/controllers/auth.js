import { db } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const register = (req, res) => {
    // check existing user
    const q = "SELECT * FROM users WHERE email = ? OR username = ?";
    db.query(q, [req.body.email, req.body.username], (err, data) => {
        if (err) return res.status(500).json(err)
        if (data.length) return res.status(409).json("Pengguna sudah ada!")

        // hash password
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt);

        const q = "INSERT INTO users(`username`, `email`, `password`) VALUES (?)";
        const values = [
            req.body.username,
            req.body.email,
            hash,
        ];

        db.query(q, [values], (err, data) => {
            if (err) return res.status(500).json(err)
            res.status(200).json("Registrasi berhasil!");
        });
    });
};

export const login = async (req, res) => {
    // check user
    const q = "SELECT * FROM users WHERE username = ?";
    db.query(q, [req.body.username], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length === 0) return res.status(404).json("Pengguna tidak ditemukan!");

        // check password
        const isPassCorrect = bcrypt.compareSync(req.body.password, data[0].password);
        if (!isPassCorrect) return res.status(401).json("Username atau Password salah!");

        const token = jwt.sign({ id: data[0].id }, process.env.JWT_SECRET);
        const {password, ...other} = data[0];

        res.cookie("access_token", token, {
            httpOnly: true
        }).status(200).json(other);
    });
};

export const logout = async (req, res) => {
    res.clearCookie("access_token", {
        sameSite: "none",
        secure: true
    }).status(200).json("Logout berhasil!");
};
