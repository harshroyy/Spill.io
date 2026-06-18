import { Router } from "express";
const router = Router();
import upload from "../middleware/multer.js";
import Category from "../models/category.js";
import Podcast from "../models/podcast.js";
import authMiddleware from "../middleware/authMiddleware.js";
import User from "../models/user.js";

// add podcast
router.post("/add-podcast", authMiddleware, upload, async (req, res) => {
    try {
        const { title, description, category } = req.body;
        const frontImage = req.files["frontImage"][0].path;
        const audioFile = req.files["audioFile"][0].path;

        if (!title || !description || !category || !frontImage || !audioFile) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const { user } = req;
        const cat = await Category.findOne({ CategoryName: category });
        if (!cat) {
            return res.status(400).json({ message: "Category not found" });
        }
        const catid = cat._id;
        const userid = user._id;
        const newPodcast = new Podcast({
            title,
            description,
            category: catid,
            frontImage,
            audioFile,
            uploadedBy: userid
        });

        await newPodcast.save();
        await Category.findByIdAndUpdate(catid, {
            $push: { podcasts: newPodcast._id }
        });
        await User.findByIdAndUpdate(userid, {
            $push: { podcasts: newPodcast._id }
        });
        res.status(200).json({ message: "Podcast added successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// get all podcasts
router.get("/get-podcasts", async (req, res) => {
    try {
        const podcasts = await Podcast.find()
            .populate("category")
            .sort({ createdAt: -1 });
        return res.status(200).json({ data: podcasts });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// get user-podcasts
router.get("/get-user-podcasts", authMiddleware, async (req, res) => {
    try {
        const { user } = req;
        const userid = user._id;
        const data = await User.findById(userid).populate({
            path: "podcasts",
            populate: { path: "category" }
        }).select("-password");
        if (data && data.podcasts) {
            data.podcasts.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        return res.status(200).json({ data: data.podcasts });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// get podcast by id
router.get("/get-podcast/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const podcast = await Podcast.findById(id).populate("category");
        if (!podcast) {
            return res.status(404).json({ message: "Podcast not found" });
        }
        return res.status(200).json({ data: podcast });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// get podcast by category
router.get("/category/:cat", async (req, res) => {
    try {
        const { cat } = req.params;
        const categories = await Category.find({ CategoryName: cat }).populate({
            path: "podcasts",
            populate: { path: "category" }
        });

        if (!categories) {
            return res.status(404).json({ message: "Category not found" });
        }
        let podcasts = [];
        categories.forEach(category => {
            podcasts = [...podcasts, ...category.podcasts];
        });
        
        return res.status(200).json({ data: podcasts });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
