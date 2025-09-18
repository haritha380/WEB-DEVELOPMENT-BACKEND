const mongoose = require('mongoose');

const showSchema = new mongoose.Schema({
    artistName: { type: String, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String, required: true } 
}, { timestamps: true });

module.exports = mongoose.model('Show', showSchema);
