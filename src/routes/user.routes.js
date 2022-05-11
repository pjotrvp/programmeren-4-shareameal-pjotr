const express = require("express");
const app = express();
const router = express.Router();
const userController = require("../controllers/user.controller");

const bodyParser = require("body-parser");
app.use(bodyParser.json());

router.get("/", (req, res) => {
  res.status(200).json({
    status: 200,
    result: "Dit is de homepage",
  });
});

router.post("/users", userController.validateUser, userController.addUser);

router.get("/users/profile", userController.getUser);

router.get("/users", userController.getAllUser);

router.get("/users/:userId", userController.getUserById);

router.put("/users/:userId", userController.putUser);

router.delete("/users/:userId", userController.deleteUser);

module.exports = router;
