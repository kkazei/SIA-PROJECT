import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendVerificationEmail, sendWelcomeEmail } from "../mailtrap/emails.js";


export const signup = async (req, res) => {
    const {email, password, name} = req.body;
    try {
    if(!email || !password || !name){
        throw new Error("Please fill all fields");
    }

    const userAlreadyExists = await User.findOne({email});
    console.log("userAlreadyExists", userAlreadyExists);
    if(userAlreadyExists){
        return res.status(400).json({success:false, message: "User already exists"});
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    const user = new User(
        {email, 
        password:hashedPassword, 
        name, 
        verificationToken, 
        verificationTokenExpiresAt: Date.now() + 10 * 60 * 1000});

    await user.save();
    

    //jwt
    generateTokenAndSetCookie(res, user._id);
    await sendVerificationEmail(user.email, verificationToken);
    res.status(201).json({
        success:true, 
        message: "User created successfully",
        user: {
            ...user._doc,
            password: undefined,
        },
        });

    } catch (error) {
        res.status(400).json({success:false, message: error.message});
    }
}

export const verifyEmail = async (req, res) => {
    const {code} = req.body;
    try {
        const user = await User.findOne({verificationToken: code, verificationTokenExpiresAt: {$gt: Date.now()}})
        if(!user){
            return res.status(400).json({success:false, message: "Invalid or expired token"});
        }
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        await user.save();

        await sendWelcomeEmail(user.email, user.name);

        res.status(200).json({success:true, message: "Email verified successfully",
            user: {
                ...user._doc,
                password: undefined,
            }
        });
    } catch (error) {
        console.log("error in verifyEmail", error);
        res.status(400).json({success:false, message: "Server Error"});
}
}

export const login = async (req, res) => {
    res.send("login route");
}

export const logout = async (req, res) => {
    res.send("logout route");
}