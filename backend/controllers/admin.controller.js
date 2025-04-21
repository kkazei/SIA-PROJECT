import { User } from "../models/user.model.js";
import { Apartment } from "../models/apartment.model.js";
import { Post } from "../models/post.model.js";
import Payment from "../models/payment.model.js";
import Lease from "../models/lease.model.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Get system statistics
export const getSystemStats = async (req, res) => {
    try {
        // Validate admin role
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin privileges required."
            });
        }

        // Count users by role
        const [
            totalUsers,
            totalTenants,
            totalLandlords,
            totalAdmins,
            totalApartments,
            availableApartments,
            occupiedApartments,
            totalPosts,
            verifiedUsers,
            unverifiedUsers
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: 'tenant' }),
            User.countDocuments({ role: 'landlord' }),
            User.countDocuments({ role: 'admin' }),
            Apartment.countDocuments(),
            Apartment.countDocuments({ status: 'available' }),
            Apartment.countDocuments({ status: 'occupied' }),
            Post.countDocuments(),
            User.countDocuments({ isVerified: true }),
            User.countDocuments({ isVerified: false })
        ]);

        // Get recent registrations
        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name email role createdAt isVerified');

        res.status(200).json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    tenants: totalTenants,
                    landlords: totalLandlords,
                    admins: totalAdmins,
                    verified: verifiedUsers,
                    unverified: unverifiedUsers
                },
                apartments: {
                    total: totalApartments,
                    available: availableApartments,
                    occupied: occupiedApartments,
                },
                posts: totalPosts,
                recentUsers
            }
        });
    } catch (error) {
        console.error("Error getting system stats:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// Get all users
export const getAllUsers = async (req, res) => {
    try {
        // Validate admin role
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin privileges required."
            });
        }

        const { role, sort = 'createdAt', order = 'desc', search } = req.query;

        // Build query
        let query = {};
        
        // Filter by role if provided
        if (role && ['tenant', 'landlord', 'admin'].includes(role)) {
            query.role = role;
        }
        
        // Add search functionality
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Sorting
        const sortOptions = {};
        sortOptions[sort] = order === 'asc' ? 1 : -1;

        const users = await User.find(query)
            .select('-password')
            .sort(sortOptions);

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error("Error getting all users:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// Get user by ID
export const getUserById = async (req, res) => {
    try {
        // Validate admin role
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin privileges required."
            });
        }

        const { id } = req.params;

        // Validate ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        // Get user details
        const user = await User.findById(id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Get associated data based on role
        let associatedData = {};

        if (user.role === 'landlord') {
            // Get landlord's apartments and posts
            const [apartments, posts] = await Promise.all([
                Apartment.find({ landlord_id: id }).countDocuments(),
                Post.find({ landlord_id: id }).countDocuments()
            ]);
            associatedData = { apartments, posts };
        } else if (user.role === 'tenant') {
            // Get tenant's apartment
            const apartment = await Apartment.findOne({ tenant_id: id, status: 'occupied' })
                .populate('landlord_id', 'name email');
            associatedData = { apartment };
        }

        res.status(200).json({
            success: true,
            data: {
                user,
                associatedData
            }
        });
    } catch (error) {
        console.error("Error getting user by ID:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// Create new user
export const createUser = async (req, res) => {
    try {
        // Validate admin role
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin privileges required."
            });
        }

        const { name, email, password, role, phone } = req.body;

        // Validate required fields
        if (!name || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "Name, email, password, and role are required"
            });
        }

        // Validate role
        if (!['tenant', 'landlord', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Role must be tenant, landlord, or admin"
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role,
            phone,
            isVerified: true // Admin-created accounts are pre-verified
        });

        await newUser.save();

        // Return user data without password
        const userData = { ...newUser._doc };
        delete userData.password;

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: userData
        });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// Update user
export const updateUser = async (req, res) => {
    try {
        // Validate admin role
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin privileges required."
            });
        }

        const { id } = req.params;
        const { name, email, role, phone, isVerified } = req.body;

        // Validate ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        // Find user
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Update fields if provided
        if (name) user.name = name;
        if (email) user.email = email;
        if (role && ['tenant', 'landlord', 'admin'].includes(role)) user.role = role;
        if (phone) user.phone = phone;
        if (isVerified !== undefined) user.isVerified = isVerified;

        // Update password if provided
        if (req.body.password) {
            user.password = await bcrypt.hash(req.body.password, 12);
        }

        await user.save();

        // Return user without password
        const userData = { ...user._doc };
        delete userData.password;

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: userData
        });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// Delete user
export const deleteUser = async (req, res) => {
    try {
        // Validate admin role
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin privileges required."
            });
        }

        const { id } = req.params;

        // Validate ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        // Find user
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check if user is an admin
        if (user.role === 'admin') {
            // Count admins to prevent deleting the last admin
            const adminCount = await User.countDocuments({ role: 'admin' });
            if (adminCount <= 1) {
                return res.status(400).json({
                    success: false,
                    message: "Cannot delete the last admin user"
                });
            }
        }

        // Check if user is a tenant currently occupying an apartment
        if (user.role === 'tenant') {
            const occupiedApartment = await Apartment.findOne({ 
                tenant_id: id, 
                status: 'occupied' 
            });

            if (occupiedApartment) {
                return res.status(400).json({
                    success: false,
                    message: "Cannot delete tenant who is currently occupying an apartment. Please vacate the apartment first."
                });
            }
        }

        // Delete user
        await User.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// Get all apartments (admin view)
export const getAllApartments = async (req, res) => {
    try {
        // Validate admin role
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin privileges required."
            });
        }

        const { status, sort = 'createdAt', order = 'desc' } = req.query;

        // Build query
        let query = {};
        
        // Filter by status if provided
        if (status && ['available', 'occupied', 'maintenance'].includes(status)) {
            query.status = status;
        }

        // Sorting
        const sortOptions = {};
        sortOptions[sort] = order === 'asc' ? 1 : -1;

        const apartments = await Apartment.find(query)
            .populate('landlord_id', 'name email')
            .populate('tenant_id', 'name email')
            .sort(sortOptions);

        res.status(200).json({
            success: true,
            count: apartments.length,
            data: apartments
        });
    } catch (error) {
        console.error("Error getting all apartments:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// Get all payments (admin view)
export const getAllPayments = async (req, res) => {
    try {
        // Validate admin role
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin privileges required."
            });
        }

        const { status, sort = 'createdAt', order = 'desc' } = req.query;

        // Build query
        let query = {};
        
        // Filter by status if provided
        if (status && ['pending', 'approved', 'rejected'].includes(status)) {
            query.status = status;
        }

        // Sorting
        const sortOptions = {};
        sortOptions[sort] = order === 'asc' ? 1 : -1;

        const payments = await Payment.find(query)
            .populate('tenant_id', 'name email')
            .populate('landlord_id', 'name email')
            .sort(sortOptions);

        res.status(200).json({
            success: true,
            count: payments.length,
            data: payments
        });
    } catch (error) {
        console.error("Error getting all payments:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// Verify a user (admin function)
export const verifyUser = async (req, res) => {
    try {
        // Validate admin role
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin privileges required."
            });
        }

        const { id } = req.params;

        // Validate ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        // Find and update user
        const user = await User.findByIdAndUpdate(
            id,
            { isVerified: true },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "User verified successfully",
            data: user
        });
    } catch (error) {
        console.error("Error verifying user:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// Reset a user's password (admin function)
export const resetUserPassword = async (req, res) => {
  try {
    // Validate admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required."
      });
    }

    const { id } = req.params;
    const { newPassword } = req.body; // Make sure this matches frontend { newPassword }

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }

    // Validate password
    if (!newPassword || newPassword.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "Password cannot be empty"
      });
    }

    // Get user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully"
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// Get all announcements
export const getAllAnnouncements = async (req, res) => {
    try {
        // Validate admin role
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin privileges required."
            });
        }

        const { sort = 'createdAt', order = 'desc' } = req.query;

        // Build query 
        // We'll get all posts since the standard Post model doesn't distinguish announcements
        let query = {};

        // Sorting
        const sortOptions = {};
        sortOptions[sort] = order === 'asc' ? 1 : -1;

        const announcements = await Post.find(query)
            .populate('landlord_id', 'name email role')
            .sort(sortOptions);

        res.status(200).json({
            success: true,
            count: announcements.length,
            data: announcements
        });
    } catch (error) {
        console.error("Error getting announcements:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// Get announcement by ID
export const getAnnouncementById = async (req, res) => {
    try {
        // Validate admin role
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin privileges required."
            });
        }

        const { id } = req.params;

        // Validate ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid announcement ID"
            });
        }

        const announcement = await Post.findById(id)
            .populate('landlord_id', 'name email role');

        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: "Announcement not found"
            });
        }

        res.status(200).json({
            success: true,
            data: announcement
        });
    } catch (error) {
        console.error("Error getting announcement:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// Create new announcement
export const createAnnouncement = async (req, res) => {
    try {
        // Validate admin role
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin privileges required."
            });
        }

        const { title, content } = req.body;
        const image_path = req.file ? `/uploads/${req.file.filename}` : null;

        // Validate required fields
        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: "Title and content are required"
            });
        }

        // Get admin user to use as landlord
        const adminUser = await User.findById(req.user.id);
        if (!adminUser) {
            return res.status(404).json({
                success: false,
                message: "Admin user not found"
            });
        }

        // Create announcement using the standard Post model
        const newAnnouncement = new Post({
            title,
            content,
            landlord_id: adminUser._id, // Use the admin's ID as landlord_id
            image_path
        });

        await newAnnouncement.save();

        res.status(201).json({
            success: true,
            message: "Announcement created successfully",
            data: newAnnouncement
        });
    } catch (error) {
        console.error("Error creating announcement:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// Update announcement
export const updateAnnouncement = async (req, res) => {
    try {
        // Validate admin role
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin privileges required."
            });
        }

        const { id } = req.params;
        const { title, content } = req.body;
        const image_path = req.file ? `/uploads/${req.file.filename}` : req.body.image_path;

        // Validate ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid announcement ID"
            });
        }

        // Find announcement
        const announcement = await Post.findById(id);
        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: "Announcement not found"
            });
        }

        // Update fields
        const updatedAnnouncement = await Post.findByIdAndUpdate(
            id,
            { 
                title: title || announcement.title,
                content: content || announcement.content,
                image_path: image_path || announcement.image_path
            },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Announcement updated successfully",
            data: updatedAnnouncement
        });
    } catch (error) {
        console.error("Error updating announcement:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// Delete announcement
export const deleteAnnouncement = async (req, res) => {
    try {
        // Validate admin role
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin privileges required."
            });
        }

        const { id } = req.params;

        // Validate ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid announcement ID"
            });
        }

        // Find and delete announcement
        const announcement = await Post.findById(id);
        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: "Announcement not found"
            });
        }

        // If announcement has an image, delete it from the server
        if (announcement.image_path) {
            const filePath = path.join(__dirname, '..', '..', announcement.image_path.substring(1));
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await Post.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Announcement deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting announcement:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

export default {
    getSystemStats,
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getAllApartments,
    getAllPayments,
    verifyUser,
    resetUserPassword,
    getAllAnnouncements,
    getAnnouncementById,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement
};