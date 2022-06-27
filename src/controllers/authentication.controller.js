// Authentication controller
const assert = require("assert");
const jwt = require("jsonwebtoken");
const dbConnection = require("../../database/dbConnection");
const logger = require("../../config/config").logger;
const jwtSecretKey = require("../../config/config").jwtSecretKey;

module.exports = {
  login(req, res, next) {
    dbConnection.getConnection((err, connection) => {
      if (err) {
        logger.error("Error getting connection from dbConnection");
        res.status(500).json({
          error: err.toString(),
          datetime: new Date().toISOString(),
        });
      }
      if (connection) {
        // 1. Kijk of deze useraccount bestaat.
        connection.query(
          "SELECT `id`, `emailAdress`, `password`, `firstName`, `lastName` FROM `user` WHERE `emailAdress` = ?",
          [req.body.emailAdress],
          (err, rows, fields) => {
            connection.release();
            if (err) {
              logger.error("Error: ", err.toString());
              res.status(500).json({
                error: err.toString(),
                datetime: new Date().toISOString(),
              });
            }
            if (rows) {
              // 2. Er was een resultaat, check het password.
              if (
                rows &&
                rows.length === 1 &&
                rows[0].password == req.body.password
              ) {
                logger.info(
                  "passwords DID match, sending userinfo and valid token"
                );
                // Extract the password from the userdata - we do not send that in the response.
                const { password, ...userinfo } = rows[0];
                // Create an object containing the data we want in the payload.
                const payload = {
                  userId: userinfo.id,
                };

                jwt.sign(
                  payload,
                  jwtSecretKey,
                  { expiresIn: "12d" },
                  function (err, token) {
                    logger.debug("User logged in, sending: ", userinfo);
                    logger.debug("jwtSecretKey: ", token);
                    res.status(200).json({
                      status: 200,
                      result: { ...userinfo, token },
                    });
                  }
                );
              } else {
                logger.info("User not found or password invalid");
                res.status(401).json({
                  message: "User not found or password invalid",
                  datetime: new Date().toISOString(),
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
    try {
      assert(
        typeof req.body.password === "string",
        "password must be a string."
      );
      assert(
        typeof req.body.emailAdress === "string",
        "email must be a string."
      );
      assert(typeof emailAdress === "string", "email cannot be null");
      assert(typeof password === "string", "password cannot be null");
      assert.match(
        req.body.password,
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
        "Password must contain 8-15 characters which contains at least one lower- and uppercase letter, one special character and one digit"
      );
      assert.match(
        req.body.emailAdress,
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Non valid email-address"
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
