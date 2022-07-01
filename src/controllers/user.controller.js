const assert = require("assert");
const jwt = require("jsonwebtoken");
const jwtSecretKey = require("../../config/config").jwtSecretKey;
const logger = require("../../config/config").logger;
const dbConnection = require("../../database/dbConnection");
const bcrypt = require("bcrypt");

const salt = bcrypt.genSaltSync(10);
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

let phoneNumberIsValid = (phoneNumber) => {
  let regex = /^[0-9]{10}$/;
  if (!regex.test(phoneNumber)) {
    return false;
  }
  return true;
};

let controller = {
  validateUser: (req, res, next) => {
    user = req.body;
    let {
      firstName,
      lastName,
      emailAdress,
      password,
      phoneNumber,
      street,
      city,
    } = user;
    try {
      assert(emailAdress, "Email is required");
      assert(emailIsValid(emailAdress), "Email is invalid");
      assert(
        passwordIsValid(password),
        "Password is invalid, min. 8 characters, 1 uppercase, 1 lowercase, 1 number"
      );
      assert(firstName, "First name is required");
      assert(lastName, "Last name is required");
      assert(phoneNumberIsValid(phoneNumber), "Phone number is invalid");
      assert(street, "Street is required");
      assert(city, "City is required");
      next();
    } catch (err) {
      res.status(400).json({
        status: 400,
        result: err.message,
      });
      next(err);
    }
  },

  addUser: (req, res) => {
    user = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      emailAdress: req.body.emailAdress,
      password: bcrypt.hashSync(req.body.password, salt),
      phoneNumber: req.body.phoneNumber,
      street: req.body.street,
      city: req.body.city,
      isActive: 1,
    };
    dbConnection.getConnection(function (error, connection) {
      if (error) throw error;
      connection.query(
        `INSERT INTO user (firstName, lastName, emailAdress, password, phoneNumber, street, city, isActive) VALUES ('${user.firstName}', '${user.lastName}', '${user.emailAdress}', '${user.password}', '${user.phoneNumber}', '${user.street}', '${user.city}', '${user.isActive}')`,
        [
          user.firstName,
          user.lastName,
          user.street,
          user.city,
          user.phoneNumber,
          user.emailAdress,
          user.password,
        ],
        function (error, result, fields) {
          if (error) {
            if (error.code == "ER_DUP_ENTRY") {
              res.status(409).json({
                status: 409,
                result: "User already exists",
              });
            } else {
              res.status(400).json({
                status: 400,
                result: "Email is invalid",
              });
            }
          } else {
            res.status(201).json({
              status: 201,
              result: user,
            });
          }
        }
      );
    });
  },

  getUserProfileFromId: (req, res, next) => {
    let authId = req.userId;
    console.log("authIdGetProfile: ", authId);
    dbConnection.getConnection(function (err, connection) {
      if (err) {
        throw err;
      }
      connection.query(
        `SELECT * FROM user WHERE id = ${authId}`,
        function (err, result, fields) {
          connection.release();
          if (err) {
            res.status(401).json({
              status: 401,
              result: err.message,
            });
          } else {
            res.status(200).json({
              status: 200,
              result: result,
            });
          }
        }
      );
    });
  },
  getUserById: (req, res, next) => {
    const userId = req.params.userId;
    dbConnection.getConnection(function (err, connection) {
      if (err) throw error;
      connection.query(
        "SELECT * FROM user WHERE id = " + userId + "",
        function (error, result, fields) {
          connection.release();
          if (error) throw error;
          logger.debug("result = ", result.length);
          if (result.length < 1) {
            const error = {
              status: 404,
              message: `User with ID ${userId} not found`,
            };
            next(error);
            return;
          }
          res.status(200).json({
            status: 200,
            result: result[0],
          });
        }
      );
    });
  },
  getAllUser: (req, res) => {
    //get params
    let query = req.query;
    let { isActive, firstName } = query;

    if (isActive == "false") isActive = 0;
    else if (isActive == "true") isActive = 1;

    // Define query
    let dbQuery = "SELECT * FROM user";
    if (isActive != undefined && firstName != undefined)
      dbQuery = `SELECT * FROM user WHERE isActive = ${isActive} AND firstname LIKE '%${firstName}%'`;
    else if (isActive != undefined && isActive != 0 && isActive != 1)
      res.status(401).json({
        status: 401,
        message: "Invalid search term!",
      });
    else if (isActive != undefined && firstName == undefined)
      dbQuery = `SELECT * FROM user WHERE isActive = ${isActive}`;
    else if (isActive == undefined && firstName != undefined)
      dbQuery = `SELECT * FROM user WHERE firstname LIKE '%${firstName}%'`;

    // Retrieve users
    dbConnection.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query(dbQuery, function (error, result, fields) {
        connection.release();
        if (error) throw error;
        logger.debug("result = ", result.length);

        for (let i = 0; i < result.length; i++) {
          result[i].isActive = result[i].isActive ? true : false;
        }

        res.status(200).json({
          status: 200,
          result: result,
        });
      });
    });
  },
  putUser: (req, res) => {
    let user = req.body;
    user.password = bcrypt.hashSync(user.password, salt);
    const userId = req.params.userId;
    dbConnection.getConnection(function (err, connection) {
      if (err) throw err;
      if (
        emailIsValid(user.emailAdress) &&
        phoneNumberIsValid(user.phoneNumber)
      ) {
        connection.query(
          `UPDATE user SET ? WHERE id = ${userId}`,
          user,
          function (err, results, fields) {
            connection.release();
            if (err) next(err);
            if (results.affectedRows == 0) {
              res.status(404).json({
                status: 404,
                result: "User does not exist",
              });
            } else {
              res.status(200).json({
                status: 200,
                result: user,
              });
            }
          }
        );
      } else if (!emailIsValid(user.emailAdress)) {
        res.status(400).json({
          status: 400,
          result: "Email is invalid",
        });
      } else if (!phoneNumberIsValid(user.phoneNumber)) {
        res.status(400).json({
          status: 400,
          result: "Phone number is invalid",
        });
      }
    });
  },
  deleteUser: (req, res) => {
const userId = req.params.userId;

dbConnection.getConnection(function (err, connection) {
  if (err) throw err;
  connection.query(
    `SELECT * FROM user WHERE id = ${userId}`,
    function (err, result, fields) {
      if (err) next(err);
      if (result.length > 0) {
        if (req.userId == userId) {
          connection.query(
            `DELETE FROM user WHERE ${userId} = user.id`,
            function (err, result, fields) {
              connection.release();
              if (err) next(err);
              if (result.affectedRows > 0) {
                res.status(200).json({
                  status: 200,
                  result: "User deleted",
                });
              }
            }
          );
        } else {
          res.status(403).json({
            status: 403,
            result: "You are not the owner of this user",
          });
        }
      } else {
        res.status(404).json({
          status: 404,
          result: "User does not exist",
        });
      }
    }
  );
});

  },
};

module.exports = controller;
