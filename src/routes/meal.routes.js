const express = require("express");
const mealRoutes = express.Router({ mergeParams: true });
const mealController = require("../controllers/meal.controller");

mealRoutes.put("/:mealId", mealController.update);
mealRoutes.post("/", mealController.create);
mealRoutes.get("/", mealController.findAll);
mealRoutes.get("/:mealId", mealController.findOne);
mealRoutes.delete("/:mealId", mealController.remove);

module.exports = mealRoutes;
