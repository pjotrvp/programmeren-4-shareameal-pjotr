const assert = require("assert");
const dbConnection = require("../../database/dbConnection");
let database = [];
let id = 0;
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

let controller = {
  validateUser: (req, res, next) => {
    let user = req.body;
    let { name, email, age, password } = user;
    try {
      assert(typeof name == "string", "name must be a string");
      assert(typeof email == "string", "email must be a string");
      assert(typeof age == "int", "age must be a int");
      assert(typeof password == "string", "password must be a string");
      next();
    } catch (err) {
      const error = {
        status: 400,
        result: err.message,
      };
      next(error);
    }
  },
  addUser: (req, res) => {
    let user = req.body;
    const firstName = req.params.firstName;
    const lastName = req.params.lastName;
    const emailAdress = req.params.emailAdress;
    const password = req.params.password;
    const street = req.params.street;
    const city = req.params.city;
    dbConnection.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query(
        `INSERT INTO user (firstName, lastName, emailAdress, password, street, city) VALUES
        (${firstName}, ${lastName}, ${password}, ${street}, ${city})`,
        function (error, results, fields) {
          connection.release();
          if (error) throw error;
          console.log("user: ", results);
          res.status(200).json({
            status: 200,
            result: results,
          });
        }
      );
    });
  },
  getUser: (req, res, next) => {
    const userId = req.params.userId;
    dbConnection.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query(
        `SELECT * FROM user WHERE ${userId} = user.id `,
        function (error, results, fields) {
          connection.release();
          if (error) throw error;
          console.log("user: ", results);
          res.status(200).json({
            status: 200,
            result: results,
          });
        }
      );
    });
  },
  getUserById: (req, res) => {
    const userId = req.params.userId;
    dbConnection.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query(
        `SELECT * FROM user WHERE ${userId} = user.id `,
        function (error, results, fields) {
          connection.release();
          if (error) throw error;
          console.log("user: ", results);
          res.status(200).json({
            status: 200,
            result: results,
          });
        }
      );
    });
  },
  getAllUser: (req, res) => {
    dbConnection.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query("SELECT * FROM user", function (error, results, fields) {
        connection.release();
        if (error) throw error;
        console.log("# of users: ", results.length);
        res.status(200).json({
          status: 200,
          result: results,
        });
      });
    });
  },
  putUser: (req, res) => {
    const userId = req.params.userId;
    const user = req.body;
    console.log(`User met ID ${userId} gezocht`);
    dbConnection.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query(
        `UPDATE user SET ? WHERE id = ${userId}`,
        function (error, results, fields) {
          connection.release();
          if (emailIsValid) {
            console.log("user: ", results);
            res.status(200).json({
              status: 200,
              result: "user updated",
            });
          } else {
            res.status(401).json({
              status: 401,
              result: `email not valid`,
            });
          }
        }
      );
    });
  },
  deleteUser: (req, res) => {
    const userId = req.params.userId;
    dbConnection.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query(
        `DELETE * FROM user WHERE ${userId} = user.id `,
        function (error, results, fields) {
          connection.release();
          if (error) throw error;
          console.log("user: ", results);
          res.status(200).json({
            status: 200,
            result: results,
          });
        }
      );
    });
  },
};
let emailIsValid = (email) => {
  let syntaxGood = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!syntaxGood) return false;
  for (let badChar of FORBIDDEN_TERMINAL_CHARACTERS) {
    if (email.startsWith(badChar) || email.endsWith(badChar)) {
      return false;
    }
  }
  return true;
};
module.exports = controller;
