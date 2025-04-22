import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  tenant_id: {
    type: String,
    required: [true, 'Tenant ID is required']
  },
  apartment_id: {
    type: String,
    required: [true, 'Apartment ID is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required']
  },
  reference_number: {
    type: String,
    required: [true, 'Reference number is required']
  },
  tenant_fullname: {
    type: String,
    required: [true, 'Tenant name is required']
  },
  image_path: {
    type: String,
    required: [true, 'Payment proof image is required']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  admin_remarks: {
    type: String,
    default: ''
  },
  payment_date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
