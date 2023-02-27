const express = require("express");
const User = require("../Models/userModels");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const middleWare = require("../midlewares/authMiddleware");
const Barber = require("../Models/barberModel");
const Appointment = require("../Models/appointmentModel");
const moment = require("moment");
router.post("/register", async (req, res) => {
  try {
    const userExist = await User.findOne({ email: req.body.email });
    if (userExist) {
      res.status(200).send({ message: "User Already Exists", sucess: false });
    }
    // const password = req.body.password;
    // const salt = await bcrypt.genSalt(10);
    // const hashePassword = await bcrypt.hash(password, salt);
    // req.body.password = hashePassword;
    const newUser = new User(req.body);
    await newUser.save();
    res.status(200).send({ message: "User Created Sucessfully", sucess: true });
  } catch (error) {
    res
      .status(500)
      .send({ message: "User Creating Error", sucess: false, error });
  }
});

router.post("/login", async (req, res) => {
  try {
    const userExist = await User.findOne({ email: req.body.email });
    if (!userExist) {
      res.status(200).send({ message: `User Doesn't Exist`, sucess: false });
    }
    const password = await User.findOne({ password: req.body.password });
    if (!password) {
      res.status(200).send({ message: `Incorrect Password`, sucess: false });
    } else {
      const token = jwt.sign({ id: userExist._id }, process.env.SECRET, {
        expiresIn: "1d",
      });
      res
        .status(200)
        .send({ message: `LogIn Sucessfully`, sucess: true, data: token });
    }
  } catch (error) {
    res
      .status(500)
      .send({ message: "User Creating Error", sucess: false, error });
  }
});

router.post("/get-user-info-by-id", middleWare, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userId });
    user.password = undefined;
    if (!user) {
      res.status(401).send({ message: "Invalid User", sucess: false });
    } else {
      res.status(200).send({ sucess: true, data: user });
    }
  } catch (error) {
    res.status(500).send({ message: "Invalid User", sucess: false });
  }
});

router.post("/apply-barber-account", middleWare, async (req, res) => {
  try {
    const newBarber = new Barber({ ...req.body, status: "pending" });
    await newBarber.save();
    const adminUser = await User.findOne({ isAdmin: true });
    const unSeenNotification = adminUser?.unSeenNotification;
    unSeenNotification.push({
      type: "new-barber-request",
      message: `${newBarber.fName} ${newBarber.lName} has applied for barber account`,
      data: {
        barberId: newBarber._id,
        name: newBarber.fName + " " + newBarber.lName,
      },
      onClickPath: "/admin/barbers",
    });
    await User.findByIdAndUpdate(adminUser._id, { unSeenNotification });
    res.status(200).send({
      message: "You Applied For Barber Account",
      sucess: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error In Creating Doctor Account",
      sucess: false,
      error,
    });
  }
});

router.post("/mark-all-as-seen", middleWare, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userId });
    const unSeenNotifications = user.unSeenNotification;
    const seenNotifications = user.seenNotification;
    seenNotifications.push(...unSeenNotifications);
    user.unSeenNotification = [];
    user.seenNotification = seenNotifications;
    const updatedUser = await user.save();
    updatedUser.password = undefined;
    res.status(200).send({
      message: "You Marked All Notifications As Seen",
      sucess: true,
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error In Creating Doctor Account",
      sucess: false,
      error,
    });
  }
});

router.post("/delete-all-notifications", middleWare, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userId });
    user.unSeenNotification = [];
    user.seenNotification = [];
    const updatedUser = await user.save();
    updatedUser.password = undefined;
    res.status(200).send({
      message: "You Deleted All Notifications",
      sucess: true,
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error In Creating Doctor Account",
      sucess: false,
      error,
    });
  }
});

router.get("/get-barbers-data", middleWare, async (req, res) => {
  try {
    const barber = await Barber.find({ status: "approved" });
    res.status(200).send({
      message: "Data fetched successfully",
      sucess: true,
      data: barber,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error applying barbers account",
      success: false,
      error,
    });
  }
});

router.post("/book-appointment", middleWare, async (req, res) => {
  try {
    req.body.status = "pending";
    req.body.date = moment(req.body.date, "DD-MM-YYYY").toISOString();
    req.body.time = moment(req.body.time, "HH:mm").toISOString();
    const newAppointment = new Appointment(req.body);
    await newAppointment.save();
    const user = await User.findOne({ _id: req.body.barberInfo.userId });
    user.unSeenNotification.push({
      type: "new-appointment-request",
      message: `A new appointment request has been made by ${req.body.userInfo.name}`,
      onClickPath: "/barber/appointments",
    });
    await user.save();
    res.status(200).send({
      message: "Appointment booked successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error booking appointment",
      success: false,
      error,
    });
  }
});

router.post("/check-booking-avilability", middleWare, async (req, res) => {
  try {
    const date = moment(req.body.date, "DD-MM-YYYY").toISOString();
    const fromTime = moment(req.body.time, "HH:mm")
      .subtract(1, "hours")
      .toISOString();
    const toTime = moment(req.body.time, "HH:mm").add(1, "hours").toISOString();
    const barberId = req.body.barberId;
    const appointments = await Appointment.find({
      barberId,
      date,
      time: { $gte: fromTime, $lte: toTime },
    });
    if (appointments.length > 0) {
      return res.status(200).send({
        message: "Appointments not available",
        success: false,
      });
    } else {
      return res.status(200).send({
        message: "Appointments available",
        success: true,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error booking appointment",
      success: false,
      error,
    });
  }
});

router.get("/get-appointments-by-user-id", middleWare, async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.body.userId });
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
});
module.exports = router;
