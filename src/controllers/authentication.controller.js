// Authentication controller
const assert = require("assert");
const jwt = require("jsonwebtoken");
const dbConnection = require("../../database/dbConnection");
const logger = require("../../config/config").logger;
const jwtSecretKey = require("../../config/config").jwtSecretKey;
const bcrypt = require("bcrypt");

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
let emailIsValid = (emailAdress) => {
  let syntaxGood = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAdress);
  if (!syntaxGood) return false;
  for (let badChar of FORBIDDEN_TERMINAL_CHARACTERS) {
    if (emailAdress.startsWith(badChar) || emailAdress.endsWith(badChar)) {
      return false;
    }
  }
  return true;
};

let passwordIsValid = (password) => {
  let regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
  if (!regex.test(password)) {
    return false;
  }
  return true;
};

module.exports = {
  login: (req, res, next) => {
    const { emailAdress, password } = req.body;

    dbConnection.getConnection(function (err, connection) {
      if (err) {
        logger.error("Error connecting to the database");
        res.status(500).json({
          error: err.toString(),
          datetime: new Date().toISOString(),
        });
      }
      if (connection) {
        connection.query(
          `SELECT id, firstName, lastName, emailAdress, password FROM user WHERE emailAdress = '${emailAdress}'`,
          [req.body.emailAdress],
          function (error, result, fields) {
            connection.release();
            if (result.length === 0) {
              logger.warn("Email not found");
              res.status(404).json({
                status: 404,
                result: "Email not found",
              });
            } else {
              validPassword = bcrypt.compareSync(
                req.body.password,
                result[0].password
              );
              if (error) {
                res.status(500).json({
                  status: 500,
                  result: "Internal server error",
                });
              }

              if (validPassword) {
                if (result) {
                  const { password, ...user } = result[0];
                  jwt.sign(
                    { userId: user.id },
                    jwtSecretKey,
                    { expiresIn: "12d" },
                    function (err, token) {
                      if (err) next(err);
                      if (token) {
                        console.log("token: ", token);
                        res.status(201).json({
                          status: 201,
                          result: { ...user, token },
                        });
                      }
                    }
                  );
                } else {
                  res.status(404).json({
                    status: 404,
                    result: "User does not exist",
                  });
                }
              } else {
                res.status(401).json({
                  status: 401,
                  result: "Password is incorrect",
                });
              }
            }
          }
        );
      }
    });
  },

  validateLogin(req, res, next) {
    // Verify that we receive the expected input
    let login = req.body;
    let { emailAdress, password } = login;
    try {
      assert(emailIsValid(emailAdress), "Email is invalid");
      assert(
        passwordIsValid(password),
        "Password is invalid, min. 8 characters, 1 uppercase, 1 lowercase, 1 number"
      );

      next();
    } catch (error) {
      const err = {
        status: 400,
        message: error.message,
      };
      next(err);
    }
  },

  validateOwnership(req, res, next) {
    const userId = req.userId;
    const mealId = req.params.mealId;
    dbConnection.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query(
        "SELECT * FROM meal WHERE id = ?;",
        [mealId],
        function (error, results, fields) {
          if (error) throw error;
          connection.release();
          if (results[0]) {
            const cookId = results[0].cookId;
            if (userId !== cookId) {
              res.status(403).json({
                status: 403,
                message:
                  "User is not the owner of the meal that is being requested to be deleted or updated",
              });
            } else {
              next();
            }
          } else {
            next();
          }
        }
      );
    });
  },

  validateOwnershipUser(req, res, next) {
    const userId = req.userId;
    const deletingUserId = req.params.userId;

    dbConnection.getConnection(function (error, connection) {
      if (error) throw error;
      connection.query(
        "SELECT * FROM user WHERE id=?",
        [deletingUserId],
        function (error, result, fields) {
          connection.release();
          if (error) throw error;

          logger.debug("result: ", result.length);

          if (result.length < 1) {
            next();
          } else {
            if (userId != deletingUserId) {
              res.status(403).json({
                status: 403,
                message: "User is not the owner",
              });
            } else {
              next();
            }
          }
        }
      );
    });
  },

  validateToken(req, res, next) {
    logger.info("validateToken called");

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      logger.warn("Authorization header missing!");
      res.status(401).json({
        status: 401,
        message: "Authorization header missing!",
      });
    } else {
      const token = authHeader.substring(7, authHeader.length);

      jwt.verify(token, jwtSecretKey, (err, payload) => {
        if (err) {
          logger.warn("Not authorized");
          res.status(401).json({
            status: 401,
            message: "Not authorized",
          });
        }
        if (payload) {
          logger.debug("token is valid", payload);
          req.userId = payload.userId;
          next();
        }
      });
    }
  },
};
