const express = require("express");
const app = express();
const router = express.Router()
const userController = require('../controllers/user.controller')

const bodyParser = require("body-parser");
app.use(bodyParser.json());

const FORBIDDEN_TERMINAL_CHARACTERS = [
    `!`,
    `#`,
    `$`,
    `%`,
    `&`,
    `'`,
    `*`,
    `+`,
    `-`,
    `/`,
    `=`,
    `?`,
    `^`,
    `_`,
    "`",
    `{`,
    `|`,
    `}`,
    `~`,
  ];


router.get("/", (req, res) => {
    res.status(200).json({
      status: 200,
      result: "Dit is de homepage",
    });
  });
  
  router.post("/api/user", userController.addUser)
  
  router.get("/api/user/:userId", userController.getUser)
  
  router.get("/api/user", userController.getAllUser);
  
  router.put("/api/user/:userId", userController.putUser)
  
  router.delete("/api/user/:userId", userController.deleteUser)
  


module.exports = router