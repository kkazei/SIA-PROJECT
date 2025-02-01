import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail } from "../mailtrap/emails.js";
import { send } from "process";


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
};

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

export const forgotPassword = async (req, res) => {
	const { email } = req.body;
	try {
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(400).json({ success: false, message: "User not found" });
		}

		// Generate reset token
		const resetToken = crypto.randomBytes(20).toString("hex");
		const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

		user.resetPasswordToken = resetToken;
		user.resetPasswordExpiresAt = resetTokenExpiresAt;

		await user.save();

		// send email
		await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

		res.status(200).json({ success: true, message: "Password reset link sent to your email" });
	} catch (error) {
		console.log("Error in forgotPassword ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

export const logout = async (req, res) => {
    res.clearCookie("token");
    res.status(200).json({success:true, message: "Logged out successfully"});
};