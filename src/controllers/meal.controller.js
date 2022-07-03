const dbConnection = require("../../database/dbConnection");
const logger = require("../../config/config").logger;
const assert = require("assert");

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

  registerMeal: (req, res, next) => {
    let meal = req.body;
    let cookId = req.userId;
    let price = parseFloat(meal.price);
    logger.debug(meal);
    dbConnection.getConnection(function (err, connection) {
      if (err) throw err;

      connection.query(
        `INSERT INTO meal (name, description, price, dateTime, imageUrl, isToTakeHome, isVegan, isVega, isActive, maxAmountOfParticipants, cookId) VALUES ('${meal.name}', '${meal.description}', ${meal.price}, '${meal.dateTime}', '${meal.imageUrl}', ${meal.isToTakeHome}, ${meal.isVegan}, ${meal.isVega}, ${meal.isActive}, ${meal.maxAmountOfParticipants},${cookId});`,
        [
          meal.dateTime,
          meal.maxAmountOfParticipants,
          price,
          meal.imageUrl,
          Number(cookId),
          meal.name,
          meal.description,
          meal.isActive,
          meal.isVega,
          meal.isVegan,
          meal.isToTakeHome,
        ],
        function (error, results, fields) {
          connection.release();
          if (error) next(error);
          else {
            connection.query(
              "SELECT * FROM meal ORDER BY id DESC LIMIT 1;",
              function (error, results, fields) {
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
    let dbQuery = "SELECT * FROM meal";
    dbConnection.getConnection(function (error, connection) {
      if (error) throw error;
      connection.query(dbQuery, function (error, result, fields) {
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
    dbConnection.getConnection(function (error, connection) {
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
    let mealId = req.params.mealId;
    let meal = req.body;
    let cookId = req.userId;
    dbConnection.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query(
        `SELECT * FROM meal WHERE id = ${mealId}`,
        function (err, result, fields) {
          if (err) next(err);
          if (result.length > 0) {
            if (result[0].cookId == cookId) {
              connection.query(
                `UPDATE meal SET ? WHERE id = ${mealId}`,
                meal,
                function (err, result, fields) {
                  connection.release();
                  if (err) next(err);
                  res.status(200).json({
                    status: 200,
                    result: meal,
                  });
                }
              );
            } else {
              res.status(403).json({
                status: 403,
                result: "You are not the owner of this meal",
              });
            }
          } else {
            res.status(404).json({
              status: 404,
              result: "Meal does not exist",
            });
          }
        }
      );
    });
  },

  deleteMealById: (req, res, next) => {
    const mealId = req.params.mealId;

    dbConnection.getConnection(function (error, connection) {
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
          // Check if user is owner of meal
          if (meal[0].cookId == req.userId) {
            // Delete meal
            connection.query(
              `DELETE IGNORE FROM meal WHERE id = ${mealId};`,
              function (error, result, fields) {
                logger.debug("Meal deleted succesfully!");
                connection.release;
                res.status(200).json({
                  status: 200,
                  message: "Meal deleted successfully",
                });
              }
            );
          } else {
            const error = {
              status: 403,
              message:
                "User is not the owner of the meal that is being requested to be deleted or updated",
            };
            next(error);
          }
        }
      );
    });
  },
  participateMeal: (req, res, next) => {
    const newUserId = req.userId;
    const mealId = req.params.mealId;

    dbConnection.getConnection(function (error, connection) {
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
