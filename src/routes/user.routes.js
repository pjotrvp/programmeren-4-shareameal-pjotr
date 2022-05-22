const express = require("express");
const router = express.Router();
const authController = require("../controllers/authentication.controller");
const userController = require("../controllers/user.controller");

router.get("/", (req, res) => {
  res.status(200).json({
    status: 200,
    result: "Dit is de homepage",
  });
});

router.post(
  "/users",
  // authController.validateToken,
  userController.validateUser,
  userController.addUser
);

router.get("/users/profile", userController.getUserProfileFromId);

router.get("/users", authController.validateToken, userController.getAllUser);

router.get(
  "/user/:userId",
  authController.validateToken,
  userController.getUserById
);

router.put("/users/:userId", userController.putUser);

router.delete("/users/:userId", userController.deleteUser);

module.exports = router;
