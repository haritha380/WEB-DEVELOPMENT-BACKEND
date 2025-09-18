const Show = require("../Model/ShowModel");


const addShow = async (req, res) => {
    const { artistName, time, location, price } = req.body;

    if (!artistName || !time || !location || !price || !req.file) {
        return res.status(400).json({ message: "All fields and image are required" });
    }

    try {
        const imageUrl = `/uploads/${req.file.filename}`;
        const show = new Show({ artistName, time, location, price, imageUrl });
        await show.save();
        return res.status(201).json({ success: true, show });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


const getAllShows = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const shows = await Show.find()
            .skip(skip)
            .limit(limit)
            .select('-__v')
            .lean();

        const total = await Show.countDocuments();
        
        return res.status(200).json({
            success: true,
            shows,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


const getShowById = async (req, res) => {
    const id = req.params.id;
    try {
        const show = await Show.findById(id);
        if (!show) return res.status(404).json({ message: "Show not found" });
        return res.status(200).json({ success: true, show });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


const updateShow = async (req, res) => {
    const id = req.params.id;
    const { artistName, time, location, price } = req.body;

    try {
        const updateData = { artistName, time, location, price };
        if (req.file) {
            updateData.imageUrl = `/uploads/${req.file.filename}`;
        }

        const show = await Show.findByIdAndUpdate(id, updateData, { new: true });
        if (!show) return res.status(404).json({ message: "Show not found" });

        return res.status(200).json({ success: true, show });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


const deleteShow = async (req, res) => {
    const id = req.params.id;
    try {
        const show = await Show.findByIdAndDelete(id);
        if (!show) return res.status(404).json({ message: "Show not found" });
        return res.status(200).json({ success: true, message: "Show deleted successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = { addShow, getAllShows, getShowById, updateShow, deleteShow };
