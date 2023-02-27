const express = require("express");
const app = express();
const User = require("./Models/userModels");
require("dotenv").config();
const dbConfig = require("./config/DBConfig");
app.use(express.json());
const userRoute = require("./routes/userRoutes");
const adminRoute = require("./routes/adminRoutes");
const barberRoute = require("./routes/barberRoute");
app.use("/api/user", userRoute);
app.use("/api/admin", adminRoute);
app.use("/api/barber", barberRoute);

const port = process.env.PORT || 5001;
console.log(process.env.DB);

app.listen(port, () => {
  console.log(`App Is Runing At ${port} Sucessfully`);
});

app.get("/ping", (req, res) => {
  res.send("Welcome");
});
