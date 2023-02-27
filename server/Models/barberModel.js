const mongoose = require("mongoose");

const barberSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    fName: {
      type: String,
      required: true,
    },
    lName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    experience: {
      type: String,
      required: true,
    },
    rate: {
      type: String,
      required: true,
    },
    timings: {
      type: Array,
      required: true,
    },
    status: {
      type: String,
      default : "pending"
    },
  },
  {
    timestamps: true,
  }
);

const barberModel = mongoose.model("barbers", barberSchema);
module.exports = barberModel;
