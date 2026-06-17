import express from "express";
import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

// User Sign Up
router.post("/sign-up", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if(!username || !email || !password) {
            return res
            .status(400)
            .json({ message: "All fields are required" });
        }
        if(username.length < 5) {
            return res
            .status(400)
            .json({ message: "Username must be at least 5 characters" });
        }
        if(password.length < 6) {
            return res
            .status(400)
            .json({ message: "Password must be at least 6 characters" });
        }

        // check user exists or not
        const existingEmail = await User.findOne({ email : email});
        const existingUsername = await User.findOne({ username : username});
        if(existingEmail || existingUsername) {
            return res
            .status(400)
            .json({ message: "Email or Username already exists" });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });

        await newUser.save();
        res.status(200).json({ message: "User registered successfully" });

    } catch (error) {
        res.status(500).json({ message: "Error in Sign Up", error});
    }
});

// User Sign In
router.post("/sign-in", async (req, res) => {
    try {
        const {email, password} = req.body;
        if(!email || !password) {
            return res
            .status(400)
            .json({ message: "All fields are required" });
        }
        const existingUser = await User.findOne({ email: email});
        if(!existingUser) {
            return res
            .status(400)
            .json({ message: "Invalid credentials" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if(!isPasswordCorrect) {
            return res
            .status(400)
            .json({ message: "Invalid credentials" });
        }

        // generate JWT token
        const token = jwt.sign(
            {id: existingUser._id, email: existingUser.email}, 
            process.env.JWT_SECRET, 
            {expiresIn: "30d"}
        );

        
        res.cookie("podcasterUserToken", token, {
            httpOnly: true,
            maxAge: 30*24*60*60*1000, // 30 days
            secure: process.env.NODE_ENV === "production",
            sameSite: "None",
        });

        res.status(200).json({
            id: existingUser._id,
            username: existingUser.username,
            email: existingUser.email,
            message: "User signed in successfully",
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error in Sign In", error});
    }
});

// User Logout
router.post("/logout", async (req, res) => {
    try {
        res.clearCookie("podcasterUserToken", {
            httpOnly: true,
        });
        res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error in Logout", error });
    }
});

// Check Cookie present or not
router.get("/check-cookie", async (req, res) => {
    try {
        const token = req.cookies.podcasterUserToken;
        if (!token) {
            return res.status(401).json({ message: "No cookie found" });
        }
        res.status(200).json({ message: "Cookie is present" });
    } catch (error) {
        res.status(500).json({ message: "Error in Checking Cookie", error });
    }
});

export default router;
