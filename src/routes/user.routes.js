const express = require("express");
const app = express();
const router = express.Router()

const bodyParser = require("body-parser");
app.use(bodyParser.json());

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

let database = [];
let id = 0;

router.get("/", (req, res) => {
    res.status(200).json({
      status: 200,
      result: "Dit is de homepage",
    });
  });
  
  router.post("/api/user", (req, res) => {
    let user = req.body;
    let existingUsers = database.filter((item) => item.email == user.email);
    if (emailIsValid(user.email) && !existingUsers.length > 0) {
      id++;
      user = {
        id,
        ...user,
      };
    console.log(user);
    database.push(user);
    res.status(201).json({
      status: 201,
      result: database,
    });
    }
    else{
      res.status(401).json({
        status: 401,
        result: `Email address ${user.email} is not valid or already exists`,
      });
    }
  });
  
  router.get("/api/user/:userId", (req, res, next) => {
    const userId = req.params.userId;
    console.log(`User met ID ${userId} gezocht`);
    let user = database.filter((item) => item.id == userId);
    if (user.length > 0) {
      console.log(user);
      res.status(200).json({
        status: 200,
        result: user,
      });
    } else {
      res.status(401).json({
        status: 401,
        result: `user with ID ${userId} not found`,
      });
    }
  });
  
  router.get("/api/user", (req, res, next) => {
    res.status(200).json({
      status: 200,
      result: database,
    });
  });
  
  router.put("/api/user/:userId", (req, res) => {
    const userId = req.params.userId;
    console.log(`User met ID ${userId} gezocht`);
    let user = database.filter((item) => item.email == user.mail);
    if (emailIsValid(user.email)) {
        let user2 = req.body;
      const targetIndex = database.findIndex(f=>f.id == userId)
      database[targetIndex] = user = {
                              userId,
                              ...user2,
                            };
      console.log(user);
      res.status(200).json({
        status: 200,
        result: user,
      });
    } else {
      res.status(401).json({
        status: 401,
        result: `user with ID ${userId} not found`,
      });
    }
  })
  
  router.delete("/api/user/:userId", (req, res) => {
    const userId = req.params.userId;
    console.log(`User met ID ${userId} gezocht`)
    let user = database.filter((item) => item.id == userId)
    if(user.length > 0){
      const targetIndex = database.findIndex(f=>f.id == userId)
      delete database[userId]
      res.status(200).json({
        status: 200,
        result: "ID deleted"
      })
    } else {
      res.status(401).json({
        status: 401,
        result: `user with ID ${userId} not found`,
      })
    }
  })
  
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

module.exports = router