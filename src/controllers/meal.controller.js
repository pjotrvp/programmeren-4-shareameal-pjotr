const dbConnection = require("../../database/dbConnection");
const logger = require("../../config/config").logger;
const assert = require("assert");
const { resourceUsage } = require("process");
const { rollback } = require("../../database/dbconnection");

let controller = {
  validateMeal: (req, res, next) => {
    let meal = req.body;
    let {
      name,
      description,
      isToTakeHome,
      imageUrl,
      price,
      isVega,
      isVegan,
      isActive,
      dateTime,
    } = meal;

    try {
      assert(typeof imageUrl === "string", "ImageUrl must be a string");
      assert(typeof name === "string", "Name must be a string");
      assert(
        typeof description === "string",
        "Description should be a string!"
      );
      assert(typeof price === "number", "Price must be a number");
      assert(typeof dateTime === "string", "DateTime must be a string");
      assert(isToTakeHome != null, "isToTakeHome cannot be null");
      assert(isVega != null, "isVega cannot be null");
      assert(isVegan != null, "isVegan cannot be null");
      assert(isActive != null, "isActive cannot be null");
      next();
    } catch (err) {
      const error = { status: 400, message: err.message };
      next(error);
    }
  },

  validateMealUpdate: (req, res, next) => {
    let meal = req.body;
    let { name, maxAmountOfParticipants, price } = meal;

    try {
      assert(typeof name === "string", "Name should be a string");
      assert(
        typeof maxAmountOfParticipants === "number",
        "maxAmountofParticipants should be a number"
      );
      assert(typeof price === "number", "Price should be a number");
      next();
    } catch (error) {
      const err = {
        status: 400,
        message: error.message,
      };
      next(err);
    }
  },

  registerMeal: (req, res, next) => {
    let meal = req.body;
    let cookId = req.userId;
    let price = parseFloat(meal.price);
    logger.debug(meal);
    dbConnection.getConnection(function (err, connection) {
      if (err) throw err;

      connection.query(
        `INSERT INTO meal (datetime, maxAmountOfParticipants, price, imageUrl, cookId, name, description, isActive, isVega, isVegan, isToTakeHome) VALUES(STR_TO_DATE(?,'%Y-%m-%dT%H:%i:%s.%fZ'), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          meal.dateTime,
          meal.maxAmountOfParticipants,
          price,
          meal.imageUrl,
          cookId,
          meal.name,
          meal.description,
          meal.isActive,
          meal.isVega,
          meal.isVegan,
          meal.isToTakeHome,
        ],
        function (error, results, fields) {
          if (error) {
            logger.debug(error);
            connection.release();
            const newError = {
              status: 409,
              message: `Meal not created`,
            };
            next(newError);
          } else {
            connection.query(
              "SELECT * FROM meal ORDER BY id DESC LIMIT 1;",
              function (error, results, fields) {
                connection.release();
                results[0].price = price;

                results[0].isActive = meal.isActive ? true : false;
                results[0].isVega = meal.isVega ? true : false;
                results[0].isVegan = meal.isVegan ? true : false;
                results[0].isToTakeHome = meal.isToTakeHome ? true : false;

                if (error) throw error;

                res.status(201).json({
                  status: 201,
                  result: results[0],
                });
              }
            );
          }
        }
      );
    });
  },
  getAllMeals: (req, res, next) => {
    dbconnection.getConnection(function (error, connection) {
      if (error) throw error;
      connection.query("SELECT * FROM meal", function (error, result, fields) {
        connection.release();
        if (error) throw error;
        logger.debug("result= ", result.length);
        res.status(200).json({
          status: 200,
          result: result,
        });
      });
    });
  },
  getMealById: (req, res, next) => {
    const mealId = req.params.mealId;
    dbconnection.getConnection(function (error, connection) {
      if (error) throw error;
      connection.query(
        "SELECT * FROM meal WHERE id = ?",
        [mealId],
        function (error, result, fields) {
          connection.release();
          if (error) throw error;

          logger.debug("result = ", result.length);
          if (result.length < 1) {
            const error = {
              status: 404,
              message: `Meal with id: ${mealId} not found!`,
            };
            next(error);
            return;
          }

          result[0].isActive = result[0].isActive ? true : false;
          result[0].isVega = result[0].isVega ? true : false;
          result[0].isVegan = result[0].isVegan ? true : false;
          result[0].isToTakeHome = result[0].isToTakeHome ? true : false;

          res.status(200).json({
            status: 200,
            result: result[0],
          });
        }
      );
    });
  },

  updateMealById: (req, res, next) => {
    const mealId = req.params.mealId;
    const newMealInfo = req.body;
    let price = parseFloat(newMealInfo.price);
    let updateAllergenes = req.body.allergenes.join();

    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query(
        `UPDATE meal SET name = ?, description = ?, isActive = ?, isVega = ?, isVegan = ?, isToTakeHome = ?, dateTime = STR_TO_DATE(?,'%Y-%m-%dT%H:%i:%s.%fZ'), imageUrl = ?, allergenes = ?, maxAmountOfParticipants = ?, price = ? WHERE id = ?;`,
        [
          newMealInfo.name,
          newMealInfo.description,
          newMealInfo.isActive,
          newMealInfo.isVega,
          newMealInfo.isVegan,
          newMealInfo.isToTakeHome,
          newMealInfo.dateTime,
          newMealInfo.imageUrl,
          updateAllergenes,
          newMealInfo.maxAmountOfParticipants,
          price,
          mealId,
        ],
        function (error, results, fields) {
          if (error) {
            connection.release();
            const newError = {
              status: 404,
              message: `Meal with ID ${mealId} not found`,
            };
            next(newError);
          } else {
            if (results.affectedRows > 0) {
              if (err) throw err;
              connection.query(
                "SELECT * FROM meal WHERE id = ?;",
                [mealId],
                function (error, results, fields) {
                  connection.release();
                  if (error) throw error;

                  results[0].price = price;

                  results[0].isActive = newMealInfo.isActive ? true : false;
                  results[0].isVega = newMealInfo.isVega ? true : false;
                  results[0].isVegan = newMealInfo.isVegan ? true : false;
                  results[0].isToTakeHome = newMealInfo.isToTakeHome
                    ? true
                    : false;

                  res.status(200).json({
                    status: 200,
                    result: results[0],
                  });
                }
              );
            } else {
              const error = {
                status: 404,
                message: `Meal with ID ${mealId} not found`,
              };
              next(error);
            }
          }
        }
      );
    });
  },

  deleteMealById: (req, res, next) => {
    const mealId = req.params.mealId;
    const userId = req.userId;

    dbconnection.getConnection(function (error, connection) {
      // Get Meal before deleting
      connection.query(
        "SELECT * FROM meal WHERE id = " + mealId,
        function (error, meal, fields) {
          if (error) throw error;
          if (meal.length < 1) {
            res.status(404).json({
              status: 404,
              message: "Meal not found!",
            });
            logger.debug("Deleting meal was not found!");
            return;
          }

          // Delete meal
          connection.query(
            "DELETE IGNORE FROM meal WHERE id = " + mealId,
            function (error, result, fields) {
              logger.debug("Meal deleted succesfully!");
              connection.release;
              res.status(200).json({
                status: 200,
                message: "Meal deleted successfully",
              });
            }
          );
        }
      );
    });
  },
  participateMeal: (req, res, next) => {
    const newUserId = req.userId;
    const mealId = req.params.mealId;

    dbconnection.getConnection(function (error, connection) {
      if (error) throw error;
      // Get the meal information
      connection.query(
        "SELECT * FROM meal WHERE id=?",
        [mealId],
        function (error, result, fields) {
          if (error) throw error;

          if (result.length < 1) {
            // Meal does not exist
            const err = {
              status: 404,
              message: "Meal does not exist!",
            };
            next(err);
          } else {
            // Get all participating users
            connection.query(
              "SELECT userId FROM meal_participants_user WHERE mealId=?",
              [mealId],
              function (error, usersInMeal, fields) {
                if (error) throw error;

                let userAlreadyParticipating = false;

                let i = 0;
                while (i < usersInMeal.length) {
                  if (usersInMeal[i].userId == newUserId)
                    userAlreadyParticipating = true;
                  i += 1;
                }

                // If user is not already paricipating
                if (!userAlreadyParticipating) {
                  // If there is no more room
                  if (usersInMeal.length == result[0].maxAmountOfParticipants) {
                    const err = {
                      status: 401,
                      message: "No participation places free!",
                    };
                    next(err);
                  }
                  // If there is room
                  else {
                    connection.query(
                      "INSERT INTO meal_participants_user (mealId, userId) VALUES (?,?)",
                      [mealId, newUserId],
                      function (error, result, fields) {
                        connection.release();
                        if (error) throw error;
                        let response = {
                          currentlyParticipating: true,
                          currentAmountOfParticipants: usersInMeal.length + 1,
                        };
                        res.status(200).json({
                          status: 200,
                          result: response,
                        });
                      }
                    );
                  }
                }
                // If user is already participating
                else {
                  connection.query(
                    "DELETE FROM meal_participants_user WHERE mealId=? AND userId=?",
                    [mealId, newUserId],
                    function (error, result, fields) {
                      connection.release();
                      if (error) throw error;
                      let response = {
                        currentlyParticipating: false,
                        currentAmountOfParticipants: usersInMeal.length,
                      };
                      res.status(200).json({
                        status: 200,
                        result: response,
                      });
                    }
                  );
                }
              }
            );
          }
        }
      );
    });
  },
};

module.exports = controller;
