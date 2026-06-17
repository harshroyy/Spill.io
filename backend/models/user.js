import mongoose from "mongoose";

const user = new mongoose.Schema(
    {
        username: {
            type: String, 
            required: true, 
            unique: true 
        },
        email: { 
            type: String, 
            required: true, 
            unique: true 
        },
        password: {
            type: String, 
            required: true 
        },
        podcasts: [{ 
            type: mongoose.Types.ObjectId, 
            ref: "podcasts" 
        }],
    },
    { timestamps: true }
);

export default mongoose.model("user", user);
