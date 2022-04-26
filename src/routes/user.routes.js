const express = require("express");
const app = express();
const router = express.Router()
const userController = require('../controllers/user.controller')

const bodyParser = require("body-parser");
app.use(bodyParser.json());



router.get("/", (req, res) => {
    res.status(200).json({
      status: 200,
      result: "Dit is de homepage",
    });
  });
  
  router.post("/user", userController.validateUser,  userController.addUser)
  
  router.get("/user/:userId", userController.getUser)
  
  router.get("/user", userController.getAllUser);
  
  router.put("/user/:userId", userController.putUser)
  
  router.delete("/user/:userId", userController.deleteUser)
  


module.exports = router