const mongoose = require("mongoose");
mongoose.connect(process.env.DB);
const connection = mongoose.connection;

connection.on("connected", () => {
  console.log("MongoDB Is connected Sucessfully");
});

connection.on("error", (error) => {
  console.log(`MongoDB Is connected Sucessfully ${error}`);
});

module.exports = mongoose;
