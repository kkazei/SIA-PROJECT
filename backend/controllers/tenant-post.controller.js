import mongoose from "mongoose";
import { Post } from "../models/post.model.js";
import { Tenant } from "../models/tenant.model.js";

// Get announcements for a tenant
export const getTenantAnnouncements = async (req, res) => {
    try {
        console.log("[getTenantAnnouncements] Starting function");
        const tenantId = req.userId;
        
        if (!tenantId) {
            console.log("[getTenantAnnouncements] No tenant ID provided");
            return res.status(400).json({
                success: false,
                message: "No tenant ID provided"
            });
        }
        
        console.log("[getTenantAnnouncements] Looking for tenant with ID:", tenantId);
        
        // Find tenant to get landlord_id
        const tenant = await Tenant.findById(tenantId);
        
        if (!tenant) {
            console.log("[getTenantAnnouncements] Tenant not found with ID:", tenantId);
            return res.status(404).json({
                success: false,
                message: "Tenant not found"
            });
        }
        
        console.log("[getTenantAnnouncements] Found tenant, landlord ID:", tenant.landlord_id);
        
        // Find all posts by this landlord
        const posts = await Post.find({ 
            landlord_id: tenant.landlord_id 
        }).sort({ createdAt: -1 });
        
        console.log(`[getTenantAnnouncements] Found ${posts.length} posts`);
        
        return res.status(200).json({
            success: true,
            count: posts.length,
            data: posts
        });
    } catch (error) {
        console.error("[getTenantAnnouncements] Error:", error);
        return res.status(200).json({
            success: true,
            message: "Error fetching announcements",
            count: 0,
            data: []
        });
    }
};

// Fallback function that returns all posts
export const getAllAnnouncementsForTenant = async (req, res) => {
    try {
        console.log("[getAllAnnouncementsForTenant] Fallback function called");
        
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .limit(10);
            
        console.log(`[getAllAnnouncementsForTenant] Found ${posts.length} posts`);
        
        return res.status(200).json({
            success: true,
            count: posts.length,
            data: posts
        });
    } catch (error) {
        console.error("[getAllAnnouncementsForTenant] Error:", error);
        return res.status(200).json({
            success: true,
            message: "Error in fallback function",
            count: 0,
            data: []
        });
    }
};