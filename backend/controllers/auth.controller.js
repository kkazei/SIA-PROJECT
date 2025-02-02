import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";

import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";


export const signup = async (req, res) => {
    const { email, password, name } = req.body;
    try {
        if (!email || !password || !name) {
            throw new Error("Please fill all fields");
        }

        const userAlreadyExists = await User.findOne({ email });
        console.log("userAlreadyExists", userAlreadyExists);
        if (userAlreadyExists) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({
            email,
            password: hashedPassword,
            name
        });

        await user.save();

        // Generate JWT and set cookie
        generateTokenAndSetCookie(res, user._id);

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                ...user._doc,
                password: undefined,
            },
        });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};



export const login = async (req, res) => {
    const {email, password} = req.body;
    try {
        const user = await User.findOne({email});
        if (!user){
            return res.status(400).json({success:false, message: "Invalid credentials"});
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(400).json({success:false, message: "Invalid credentials"});
        }
        generateTokenAndSetCookie(res, user._id);
        user.lastLogin = new Date();
        await user.save();

        res.status(200).json({success:true, message: "Logged in successfully",
            user: {
                ...user._doc,
                password: undefined,
            }
        });
    } catch (error) {
        console.log("error in login", error);
        res.status(400).json({success:false, message: error.message});
      }
};



export const checkAuth = async (req, res) => {
    try {
        const user = await User.findById(req.userId)
        if(!user){
            return res.status(400).json({success:false, message: "User not found"})
        }

        res.status(200).json({success:true, user: {
            ...user._doc,
            password: undefined,
        }});
    } catch (error) {
        console.log("Error in checkAuth ", error);
        res.status(400).json({success:false, message: error.message});
    }
};

export const logout = async (req, res) => {
    res.clearCookie("token");
    res.status(200).json({success:true, message: "Logged out successfully"});
};