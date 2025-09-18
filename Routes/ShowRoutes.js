const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
    addShow,
    getAllShows,
    getShowById,
    updateShow,
    deleteShow
} = require("../Controllers/ShowController");


const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });


router.post("/", upload.single("image"), addShow);          
router.get("/", getAllShows);                                 
router.get("/:id", getShowById);                              
router.put("/:id", upload.single("image"), updateShow);       
router.delete("/:id", deleteShow);                            

module.exports = router;
