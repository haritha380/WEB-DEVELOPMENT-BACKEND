const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: { type: String, required: false },
    nic: { type: String, required: false },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    gender: { type: String, enum: ["Male", "Female", "N/A"], required: false },
    country: { type: String, enum: ["Belgium", "France", "Sweden"], required: false },
    language: { type: String, enum: ["English", "Spanish", "French", "German", "Dutch", "Japanese"], required: false },
    profilepicture: { type: String, default: "https://example.com/default-avatar.png" },
    isAdmin: { type: Boolean, default: false },

    boughtShows: [
        {
            showId: { type: Schema.Types.ObjectId, ref: "ShowModel" },
            artistName: String,
            time: String,
            location: String,
            price: Number,
            quantity: Number,
            imageUrl: String,
        }
    ]
});

module.exports = mongoose.model("UserModel", userSchema);