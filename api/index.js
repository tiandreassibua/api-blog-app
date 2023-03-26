import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import postRoutes from "./routes/posts.js";
import userRoutes from "./routes/users.js";
import authRoutes from "./routes/auth.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const PORT = process.env.APP_PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "../client/public/uploads/");
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const name = uniqueSuffix + "-" + Date.now() + ext;
        cb(null, name);
    },
});

const upload = multer({ storage }); 

app.post("/api/upload", upload.single("file"), (req, res) => {
    const file = req.file;
    res.status(200).json(file.filename);
});

app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
    console.log(`Server is up and running on port ${PORT}`);
});
