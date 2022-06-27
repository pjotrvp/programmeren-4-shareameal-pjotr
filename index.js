const express = require("express");
const app = express();

const authRoutes = require("./src/routes/authentication.routes");
const logger = require("./config/config").logger;

require("dotenv").config();
const port = process.env.PORT;

const bodyParser = require("body-parser");
app.use(bodyParser.json());
const userRouter = require("./src/routes/user.routes");
const mealRouter = require("./src/routes/meal.routes");

app.all("*", (req, res, next) => {
  const method = req.method;
  logger.debug(`Method ${method} is aangeroepen`);
  next();
});

app.use("/api", userRouter, mealRouter, authRoutes);

app.all("*", (req, res) => {
  res.status(401).json({
    status: 401,
    result: "End-point not found",
  });
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status).json(err);
});

app.listen(port, () => {
  logger.debug(`Example app listening on port ${port}`);
});

process.on("SIGINT", () => {
  logger.debug("SIGINT signal received: closing HTTP server");
  dbConnection.end((err) => {
    logger.debug("Database connection closed");
  });
  app.close(() => {
    logger.debug("HTTP server closed");
  });
});

module.exports = app;
