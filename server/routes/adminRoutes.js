const express = require("express");
const User = require("../Models/userModels");
const router = express.Router();
const Barber = require("../Models/barberModel");
const authMiddleware = require("../midlewares/authMiddleware");

router.get("/get-all-users", authMiddleware, async (req, res) => {
  try {
    const users = await User.find({});
    res
      .status(200)
      .send({ message: "All Barbers Fetched", sucess: true, data: users });
  } catch (error) {
    res
      .status(500)
      .send({ message: "User Creating Error", sucess: false, error });
  }
});
router.get("/get-all-barbers", authMiddleware, async (req, res) => {
  try {
    const barbers = await Barber.find({});
    res
      .status(200)
      .send({ message: "All Barbers Fetched", sucess: true, data: barbers });
  } catch (error) {
    res
      .status(500)
      .send({ message: "User Creating Error", sucess: false, error });
  }
});
router.post(
  "/change-barber-account-status",
  authMiddleware,
  async (req, res) => {
    try {
      const { barberId, status } = req.body;
      const barber = await Barber.findByIdAndUpdate(barberId, {
        status,
      });

      const user = await User.findOne({ _id: barber.userId });
      const unseenNotifications = user.unSeenNotification;
      unseenNotifications.push({
        type: "new-barber-request",
        message: `Admin ${status} your barber account request`,
        onClickPath: "/notifications",
      });
      user.isBarber = status === "approved" ? true : false;
      await user.save();
      res.status(200).send({
        message: "Barber status updated successfully",
        success: true,
        data: barber,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Error applying barber account",
        success: false,
        error,
      });
    }
  }
);

module.exports = router;
