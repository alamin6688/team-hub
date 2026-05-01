const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const routes = require("./routes");
const globalErrorHandler = require("./middleware/globalErrorHandler");

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", routes);

app.get("/", (req, res) => {
  res.send("Collaborative Team Hub API is running...");
});

// Global Error Handler
app.use(globalErrorHandler);

module.exports = app;
