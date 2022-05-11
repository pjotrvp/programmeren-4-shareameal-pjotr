const express = require("express");
const userRouter = require('./src/routes/user.routes')
const bodyParser = require("body-parser");
require("dotenv").config()
const app = express();
const port = process.env.PORT
app.use(bodyParser.json());

app.use("/api", userRouter)

app.all("*", (req, res, next) => {
  const method = req.method;
  console.log(`Method ${method} is aangeroepen`);
  next();
});

app.use((err,req,res,next)=>{
  res.status(err.status).json(err)
})
app.all("*", (req, res) => {
  res.status(401).json({
    status: 401,
    result: "End-point not found",
  });
});

app.listen(port, () => {
  console.log(`ShareAMeal app listening on port ${port}`);
});

module.exports = app
