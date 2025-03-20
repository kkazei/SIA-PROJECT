import mongoose from "mongoose";

const paymentQRSchema = new mongoose.Schema(
  {
    landlord_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    details: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export const PaymentQR = mongoose.model("PaymentQR", paymentQRSchema);