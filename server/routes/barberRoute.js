const express = require("express");
const router = express.Router();
const Barber = require("../Models/barberModel");
const authMiddleware = require("../midlewares/authMiddleware");
const Appointment = require("../Models/appointmentModel");
const User = require("../Models/userModels");
router.post("/get-barber-info-by-id", authMiddleware, async (req, res) => {
  try {
    const barber = await Barber.findOne({ userId: req.body.userId });
    res.status(200).send({
      sucess: true,
      message: "Data Fatched Sccessfully",
      data: barber,
    });
  } catch (error) {
    res.status(500).send({
      message: "Barber Fetching Creating Error",
      sucess: false,
      error,
    });
  }
});

router.post(
  "/get-barber-info-by-barberId",
  authMiddleware,
  async (req, res) => {
    try {
      const barber = await Barber.findOne({ _id: req.body.barberId });
      res.status(200).send({
        sucess: true,
        message: "Data Fatched Sccessfully",
        data: barber,
      });
    } catch (error) {
      res.status(500).send({
        message: "Barber Fetching Creating Error",
        sucess: false,
        error,
      });
    }
  }
);

router.post("/update-barber-profile", authMiddleware, async (req, res) => {
  try {
    const barber = await Barber.findOneAndUpdate(
      { userId: req.body.userId },
      req.body
    );
    res.status(200).send({
      sucess: true,
      message: "Profile Updated Sccessfully",
      data: barber,
    });
  } catch (error) {
    res.status(500).send({
      message: "Barber Fetching Creating Error",
      sucess: false,
      error,
    });
  }
});

router.get("/get-appointments-by-barber-id",authMiddleware,async (req, res) => {
    try {
      const barber = await Barber.findOne({ userId: req.body.userId });
      const appointments = await Appointment.find({ barberId: barber._id });
      res.status(200).send({
        message: "Appointments fetched successfully",
        success: true,
        data: appointments,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Error fetching appointments",
        success: false,
        error,
      });
    }
  }
);

router.post("/change-appointment-status", authMiddleware, async (req, res) => {
  try {
    const { appointmentId, status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(appointmentId, {
      status,
    });

    const user = await User.findOne({ _id: appointment.userId });
    const unseenNotifications = user.unSeenNotification;
    unseenNotifications.push({
      type: "appointment-status-changed",
      message: `Your appointment status has been ${status}`,
      onClickPath: "/appointments",
    });

    await user.save();

    res.status(200).send({
      message: "Appointment status updated successfully",
      success: true
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error changing appointment status",
      success: false,
      error,
    });
  }
});
module.exports = router;
