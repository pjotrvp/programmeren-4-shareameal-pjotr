const assert = require('assert');
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
    validateUser:(req,res,next)=>{
        let user = req.body
        let{name, email, age, password} = user
        try{

            assert(typeof name == 'string','name must be a string')
            assert(typeof email == 'string', 'email must be a string')
            assert(typeof age == 'int', 'age must be a int')
            assert(typeof password == 'string', 'password must be a string')
            next()
        }
        catch(err){
            const error={
                status:400,
                result: err.message,

            }
            next(error)
        }
    }
    ,
    addUser:(req,res)=> {
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

    },
    getUser:(req,res,next)=> {
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
        const error={
            status: 401,
            result: `user with email ${userId} niet gevonden`
        }
        next(error)
    }
    }
    ,
    getAllUser:(req,res)=> {
        res.status(200).json({
            status: 200,
            result: database,
          });
    }
    ,
    putUser:(req,res)=> {
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
    }
    ,
    deleteUser:(req,res)=> {
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
    }
    
}
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
module.exports = controller