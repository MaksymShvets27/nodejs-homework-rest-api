const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const mongoose = require("mongoose");

// use environment variables (.env file)
dotenv.config({ path: "./.env" });

const contactRouter = require("./routes/api/contacts");
const userRouter = require("./routes/api/users");
// initialize application
const app = express();

// use morgan logger in 'development' mode
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// Mongo DB connection
mongoose.connect(process.env.MONGO_URL).then((connection) => {
  // console.log(connection);
  console.log("Mongo DB connected..");
});

// cors middleware
app.use(cors());

// static data
app.use(express.static("public"));

// parse request body
app.use(express.json());

// Routes
app.use("/api/contacts", contactRouter);
app.use("/api/users", userRouter);

/**
 * Handle "not found" requests
 */
app.all("*", (req, res) => {
  res.status(404).json({
    msg: "Not Found!",
  });
});

/**
 * Global error handler (middleware with 4 params)
 */
app.use((err, req, res, next) => {
  const { status } = err;

  // if no status code, send 500 (internal server error)
  res.status(status || 500).json({
    msg: err.message,
  });
});

// Set application running PORT =================================
const port = process.env.PORT || 3000;

// Launch server
app.listen(port, () => {
  console.log(`Database connection successful`);
});
