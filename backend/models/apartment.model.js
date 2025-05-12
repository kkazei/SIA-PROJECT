import mongoose from "mongoose";

const apartmentSchema = new mongoose.Schema({
    room: {
        type: String,
        required: true
    },
    rent: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    bedrooms: { 
        type: Number, 
        default: 1 
    },
      bathrooms: { 
        type: Number, 
        default: 1 
    },
    landlord_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tenant_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  // Changed from 'Tenant' to 'User'
        default: null
    },
    address: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        zipCode: { type: String },
        country: { type: String, default: 'Philippines' },
        location: {
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
        }
      },
      images: [{
        type: String
      }],
    status: {
        type: String,
        enum: ['available', 'occupied', 'maintenance'],
        default: 'available'
    },
    paymentInfo: {
        nextDueDate: {
            type: Date
        },
        lastPaymentDate: {
            type: Date
        },
        paymentStatus: {
            type: String,
            enum: ['paid', 'pending', 'overdue'],
            default: 'pending'
        },
        moveInDate: {
            type: Date
        }
    },
    ratings: {
        average: {
            type: Number,
            default: 0
        },
        count: {
            type: Number,
            default: 0
        }
    }
}, { timestamps: true });

// Add an index for faster queries
apartmentSchema.index({ landlord_id: 1 });
apartmentSchema.index({ status: 1 });
apartmentSchema.index({ "address.location": "2dsphere" }); // Update geospatial index

export const Apartment = mongoose.model("Apartment", apartmentSchema);