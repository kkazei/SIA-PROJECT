import { Property } from '../models/property.model.js';

// Create a new property
export const createProperty = async (req, res) => {
  try {
    // Check if user is a landlord
    if (req.user.role !== 'landlord') {
      return res.status(403).json({
        success: false,
        message: 'Only landlords can create properties'
      });
    }

    const newProperty = new Property({
      ...req.body,
      landlord: req.user.id
    });

    await newProperty.save();

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      property: newProperty
    });
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating property',
      error: error.message
    });
  }
};

// Get all properties with basic filtering
export const getAllProperties = async (req, res) => {
  try {
    const { 
      city, 
      propertyType, 
      minRent, 
      maxRent, 
      bedrooms 
    } = req.query;
    
    // Build filter
    const filter = {};
    
    if (city) filter.city = { $regex: city, $options: 'i' };
    if (propertyType) filter.propertyType = propertyType;
    if (bedrooms) filter.bedrooms = Number(bedrooms);
    
    if (minRent || maxRent) {
      filter.rentAmount = {};
      if (minRent) filter.rentAmount.$gte = Number(minRent);
      if (maxRent) filter.rentAmount.$lte = Number(maxRent);
    }

    const properties = await Property.find(filter)
      .populate('landlord', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: properties.length,
      properties
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching properties',
      error: error.message
    });
  }
};

// Get a single property by ID
export const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('landlord', 'name email');

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.status(200).json({
      success: true,
      property
    });
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching property',
      error: error.message
    });
  }
};

// Get properties listed by the logged-in landlord
export const getMyProperties = async (req, res) => {
  try {
    // Only landlords can access their properties
    if (req.user.role !== 'landlord') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const properties = await Property.find({ landlord: req.user.id });

    res.status(200).json({
      success: true,
      count: properties.length,
      properties
    });
  } catch (error) {
    console.error('Get my properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your properties',
      error: error.message
    });
  }
};

// Update a property
export const updateProperty = async (req, res) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check ownership
    if (property.landlord.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own properties'
      });
    }

    property = await Property.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Property updated successfully',
      property
    });
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating property',
      error: error.message
    });
  }
};

// Delete a property
export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check ownership
    if (property.landlord.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own properties'
      });
    }

    await Property.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting property',
      error: error.message
    });
  }
};