const User = require("../Model/User");


const getAllUsers= async(req,res)=>{
    try{
        const users = await User.find();
        return res.status(200).json({users});
    }catch(err){
        return res.status(500).json({message: "Server error"});
    }
};

const addUsers = async (req, res) => {
    const { name, nic, email, password, country, gender, language, profilepicture } = req.body;
    try {
        const user = new User({ name, nic, email, password, country, gender, language, profilepicture });
        await user.save();
        return res.status(201).json({ user });
    } catch (err) {
        return res.status(500).json({ message: "Unable to add user" });
    }
};

const getById = async(req,res)=>{
    try{
        const user = await User.findById(req.params.id);
        if(!user) return res.status(404).json({message:"User Not Found"});
        return res.status(200).json({user});
    }catch(err){
        return res.status(500).json({message:"Server error"});
    }
};

const updateUser= async(req,res)=>{
    try{
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if(!user) return res.status(404).json({message:"Unable to Update User Details"});
        return res.status(200).json({user});
    }catch(err){
        return res.status(500).json({message:"Server error"});
    }
};

const deleteUser = async(req,res)=>{
    try{
        const user= await User.findByIdAndDelete(req.params.id);
        if(!user) return res.status(404).json({message:"Unable to delete User Details"});
        return res.status(200).json({user});
    }catch(err){
        return res.status(500).json({message:"Server error"});
    }
};

const loginUser=async(req,res)=>{
    const{email,password}=req.body;
    try{
        const user= await User.findOne({email,password});
        if(!user) return res.json({success:false,message:"Invalid email or password"});
        res.json({success:true,user})
    }catch(err){
        res.status(500).json({success:false,message:"server error"});
    }
};


const addBoughtShows = async (req, res) => {
    const { userId, cartItems } = req.body;

    if (!userId || !cartItems || !cartItems.length) {
        return res.status(400).json({ success: false, message: "User ID and cart items are required" });
    }

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        cartItems.forEach(item => {
            user.boughtShows.push({
                showId: item._id,
                artistName: item.name,
                time: item.time,
                location: item.location,
                price: item.price,
                quantity: item.quantity,
                imageUrl: item.image
            });
        });

        await user.save();
        return res.status(200).json({ success: true, boughtShows: user.boughtShows });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = {
    loginUser,
    getAllUsers,
    addUsers,
    getById,
    updateUser,
    deleteUser,
    addBoughtShows
};
