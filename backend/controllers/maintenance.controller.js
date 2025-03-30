import { Maintenance } from "../models/maintenance.model.js";
import mongoose from "mongoose";

// Create a new maintenance record
export const createMaintenance = async (req, res, next) => {
  try {
    const { start_date, description, expenses, status } = req.body;
    
    // Create new maintenance record
    const newMaintenance = new Maintenance({
      landlord_id: req.user.id,
      start_date,
      description,
      expenses: expenses || 0.0,
      status: status || "pending",
    });

    // Save to database
    await newMaintenance.save();
    
    res.status(201).json({
      success: true,
      message: "Maintenance record created successfully",
      data: newMaintenance,
    });
  } catch (error) {
    next(error);
  }
};

// Get all maintenance records for a landlord
export const getMaintenancesByLandlord = async (req, res, next) => {
  try {
    const maintenances = await Maintenance.find({
      landlord_id: req.user.id,
      isVisible: true,
      isArchived: { $ne: true } // Exclude archived maintenances
    }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: maintenances.length,
      data: maintenances,
    });
  } catch (error) {
    next(error);
  }
};

// Get a specific maintenance record
export const getMaintenanceById = async (req, res, next) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id);
    
    if (!maintenance || !maintenance.isVisible) {
      return res.status(404).json({
        success: false,
        message: "Maintenance record not found"
      });
    }
    
    // Check if user has permission to view this maintenance
    if (maintenance.landlord_id.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this record"
      });
    }
    
    res.status(200).json({
      success: true,
      data: maintenance,
    });
  } catch (error) {
    next(error);
  }
};

// Update a maintenance record
export const updateMaintenance = async (req, res, next) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id);
    
    if (!maintenance || !maintenance.isVisible) {
      return res.status(404).json({
        success: false,
        message: "Maintenance record not found"
      });
    }
    
    // Check if user has permission to update this maintenance
    if (maintenance.landlord_id.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this record"
      });
    }
    
    // If status is being updated to "completed", set end_date to now if not provided
    if (req.body.status === "completed" && !req.body.end_date) {
      req.body.end_date = new Date();
    }
    
    const updatedMaintenance = await Maintenance.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      message: "Maintenance record updated successfully",
      data: updatedMaintenance,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a maintenance record (soft delete)
export const deleteMaintenance = async (req, res, next) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id);
    
    if (!maintenance || !maintenance.isVisible) {
      return res.status(404).json({
        success: false,
        message: "Maintenance record not found"
      });
    }
    
    // Check if user has permission to delete this maintenance
    if (maintenance.landlord_id.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this record"
      });
    }
    
    // Soft delete by setting isVisible to false
    await Maintenance.findByIdAndUpdate(
      req.params.id,
      { $set: { isVisible: false } }
    );
    
    res.status(200).json({
      success: true,
      message: "Maintenance record deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Archive a maintenance record
export const archiveMaintenance = async (req, res, next) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id);
    
    if (!maintenance || !maintenance.isVisible) {
      return res.status(404).json({
        success: false,
        message: "Maintenance record not found"
      });
    }
    
    // Check if user has permission to archive this maintenance
    if (maintenance.landlord_id.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to archive this record"
      });
    }
    
    // Archive by setting isArchived to true
    await Maintenance.findByIdAndUpdate(
      req.params.id,
      { $set: { isArchived: true } }
    );
    
    res.status(200).json({
      success: true,
      message: "Maintenance record archived successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get all archived maintenance records for a landlord
export const getArchivedMaintenances = async (req, res, next) => {
  try {
    const maintenances = await Maintenance.find({
      landlord_id: req.user.id,
      isVisible: true,
      isArchived: true
    }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: maintenances.length,
      data: maintenances,
    });
  } catch (error) {
    next(error);
  }
};

// Restore an archived maintenance record
export const restoreArchive = async (req, res, next) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id);
    
    if (!maintenance || !maintenance.isVisible) {
      return res.status(404).json({
        success: false,
        message: "Maintenance record not found"
      });
    }
    
    // Check if user has permission to restore this maintenance
    if (maintenance.landlord_id.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to restore this record"
      });
    }
    
    if (!maintenance.isArchived) {
      return res.status(400).json({
        success: false,
        message: "Maintenance record is not archived"
      });
    }
    
    // Restore by setting isArchived to false
    await Maintenance.findByIdAndUpdate(
      req.params.id,
      { $set: { isArchived: false } }
    );
    
    res.status(200).json({
      success: true,
      message: "Maintenance record restored successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Permanently delete a maintenance record
export const permanentlyDeleteMaintenance = async (req, res, next) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id);
    
    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: "Maintenance record not found"
      });
    }
    
    // Check if user has permission to delete this maintenance
    if (maintenance.landlord_id.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this record"
      });
    }
    
    // Make sure the record is archived before permanent deletion
    if (!maintenance.isArchived) {
      return res.status(400).json({
        success: false,
        message: "Only archived records can be permanently deleted"
      });
    }
    
    // Permanently delete the record from the database
    await Maintenance.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: "Maintenance record permanently deleted",
    });
  } catch (error) {
    next(error);
  }
};

// Get maintenance statistics for a landlord
export const getMaintenanceStats = async (req, res, next) => {
  try {
    const stats = await Maintenance.aggregate([
      {
        $match: {
          landlord_id: new mongoose.Types.ObjectId(req.user.id),
          isVisible: true,
        }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalExpenses: { $sum: "$expenses" }
        }
      }
    ]);
    
    const formattedStats = {
      pending: { count: 0, expenses: 0 },
      ongoing: { count: 0, expenses: 0 },
      completed: { count: 0, expenses: 0 },
    };
    
    stats.forEach(item => {
      if (item._id) {
        formattedStats[item._id] = {
          count: item.count,
          expenses: item.totalExpenses
        };
      }
    });
    
    res.status(200).json({
      success: true,
      data: formattedStats,
    });
  } catch (error) {
    next(error);
  }
};