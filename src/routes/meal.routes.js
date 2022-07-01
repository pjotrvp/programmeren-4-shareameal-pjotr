const express = require("express");
const router = express.Router();
const mealController = require("../controllers/meal.controller");
const authController = require("../controllers/authentication.controller");

router.get("/", (req, res) => {
  res.status(200).json({
    status: 200,
    result: "Welcome to Share-a-meal API",
  });
});

// UC-301
router.post(
  "/meal",
  authController.validateToken,
  mealController.validateMeal,
  mealController.registerMeal
);

// UC-302
router.get("/meal", mealController.getAllMeals);

// UC-303
router.get("/meal/:mealId", mealController.getMealById);

// UC-304
router.put(
  "/meal/:mealId",
  authController.validateToken,
  authController.validateOwnership,
  mealController.validateMealUpdate,
  mealController.updateMealById
);

// UC-305
router.delete(
  "/meal/:mealId",
  authController.validateToken,
  mealController.deleteMealById
);

//UC-401
router.get(
  "/meal/:mealId/participate",
  authController.validateToken,
  mealController.participateMeal
);

module.exports = router;
