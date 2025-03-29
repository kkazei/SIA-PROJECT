import { Inquiry } from "../models/inquiry.model.js";

// Create a new inquiry
export const createInquiry = async (req, res, next) => {
  try {
    const { description, category, tenant_id } = req.body;
    
    // Validate required fields
    if (!description || !category || !tenant_id) {
      return next(errorHandler(400, "Missing required fields"));
    }
    
    const newInquiry = new Inquiry({
      description,
      category,
      tenant_id,
      image_path: req.body.image_path || null
    });
    
    const savedInquiry = await newInquiry.save();
    res.status(201).json(savedInquiry);
  } catch (error) {
    next(error);
  }
};

// Get all inquiries
export const getAllInquiries = async (req, res, next) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.status(200).json(inquiries);
  } catch (error) {
    next(error);
  }
};

// Get inquiries by tenant ID
export const getInquiriesByTenant = async (req, res, next) => {
  try {
    const { tenantId } = req.params;
    
    const inquiries = await Inquiry.find({ tenant_id: tenantId }).sort({ createdAt: -1 });
    res.status(200).json(inquiries);
  } catch (error) {
    next(error);
  }
};

// Get inquiry by ID
export const getInquiryById = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    
    if (!inquiry) {
      return next(errorHandler(404, "Inquiry not found"));
    }
    
    res.status(200).json(inquiry);
  } catch (error) {
    next(error);
  }
};

// Update inquiry status
export const updateInquiryStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!['Open', 'In Progress', 'Resolved'].includes(status)) {
      return next(errorHandler(400, "Invalid status value"));
    }
    
    const updatedInquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!updatedInquiry) {
      return next(errorHandler(404, "Inquiry not found"));
    }
    
    res.status(200).json(updatedInquiry);
  } catch (error) {
    next(error);
  }
};

// Update inquiry details
export const updateInquiry = async (req, res, next) => {
  try {
    const { description, category, image_path } = req.body;
    
    const updatedInquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      {
        ...(description && { description }),
        ...(category && { category }),
        ...(image_path !== undefined && { image_path })
      },
      { new: true }
    );
    
    if (!updatedInquiry) {
      return next(errorHandler(404, "Inquiry not found"));
    }
    
    res.status(200).json(updatedInquiry);
  } catch (error) {
    next(error);
  }
};

// Delete inquiry
export const deleteInquiry = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    
    if (!inquiry) {
      return next(errorHandler(404, "Inquiry not found"));
    }
    
    await Inquiry.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Inquiry has been deleted" });
  } catch (error) {
    next(error);
  }
};

// Get inquiries by status
export const getInquiriesByStatus = async (req, res, next) => {
  try {
    const { status } = req.params;
    
    if (!['Open', 'In Progress', 'Resolved'].includes(status)) {
      return next(errorHandler(400, "Invalid status"));
    }
    
    const inquiries = await Inquiry.find({ status }).sort({ createdAt: -1 });
    res.status(200).json(inquiries);
  } catch (error) {
    next(error);
  }
};

// Get inquiries by category
export const getInquiriesByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    
    if (!['General Inquiry', 'Maintenance', 'Payment Issue'].includes(category)) {
      return next(errorHandler(400, "Invalid category"));
    }
    
    const inquiries = await Inquiry.find({ category }).sort({ createdAt: -1 });
    res.status(200).json(inquiries);
  } catch (error) {
    next(error);
  }
};