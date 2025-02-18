import { User } from "../models/user.model.js";
import { Tenant } from "../models/tenant.model.js"; // Import the Tenant model
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";

export const signup = async (req, res) => {
    const { user_email, password, user_fullname, user_phone } = req.body;
    try {
        if (!user_email || !password || !user_fullname) {
            throw new Error("Please fill all required fields");
        }

        const userAlreadyExists = await User.findOne({ user_email });
        if (userAlreadyExists) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({
            user_email,
            password: hashedPassword,
            user_fullname,
            user_phone,
            user_role: 'landlord' // Automatically set user_role to 'landlord'
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

export const signupTenant = async (req, res) => {
    const { tenant_email, password, tenant_fullname, tenant_phone, room = "Not Assigned", rent = 0, due_date = null } = req.body;
    try {
        if (!tenant_email || !password || !tenant_fullname) {
            throw new Error("Please fill all required fields");
        }

        const tenantAlreadyExists = await Tenant.findOne({ tenant_email });
        if (tenantAlreadyExists) {
            return res.status(400).json({ success: false, message: "Tenant already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const tenant = new Tenant({
            tenant_email,
            password: hashedPassword,
            tenant_fullname,
            tenant_phone,
            room,
            rent,
            status: 'pending', // Automatically set status to 'pending'
            due_date // Set due_date to provided value or null
        });

        await tenant.save();

        // Generate JWT and set cookie
        generateTokenAndSetCookie(res, tenant._id);

        res.status(201).json({
            success: true,
            message: "Tenant created successfully",
            tenant: {
                ...tenant._doc,
                password: undefined,
            },
        });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
export const login = async (req, res) => {
    const { user_email, password } = req.body;
    try {
        const user = await User.findOne({ user_email });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        // Generate JWT and set cookie
        generateTokenAndSetCookie(res, user._id);

        res.status(200).json({
            success: true,
            message: "Logged in successfully",
            user: {
                ...user._doc,
                password: undefined,
            },
        });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const Tenantlogin = async (req, res) => {
    const { tenant_email, password } = req.body;
    try {
        const tenant = await Tenant.findOne({ tenant_email });
        if (!tenant) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, tenant.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        // Generate JWT and set cookie
        generateTokenAndSetCookie(res, tenant._id);

        res.status(200).json({
            success: true,
            message: "Logged in successfully",
            tenant: {
                ...tenant._doc,
                password: undefined,
            },
        });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
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