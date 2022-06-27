process.env.DB_DATABASE = process.env.DB_DATABASE || "sharemealtestdb";
process.env.LOGGER = "warn";

const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../index");
const assert = require("assert");
require("dotenv").config();
const dbConnection = require("../../database/dbConnection");
const jwt = require("jsonwebtoken");
const { jwtSecretKey, logger } = require("../../config/config");
const bcrypt = require("bcrypt");
const salt = bcrypt.genSaltSync(10);

chai.should();
chai.use(chaiHttp);

const CLEAR_MEAL_TABLE = `DELETE IGNORE FROM meal;`;
const CLEAR_PARTICIPANT_TABLE = `DELETE IGNORE FROM meal_participants_user;`;
const CLEAR_USER_TABLE = `DELETE IGNORE FROM user;`;
const INSERT_USER = `INSERT INTO user (firstName, lastName, emailAdress, password, phoneNumber, street, city, isActive) VALUES ('test', 'test', 'test@test.com', '${bcrypt.hashSync("testT2123", salt)}', '12345678', 'test', 'test', true);`;
const AUTO_INCREMENT_USER = `ALTER TABLE user AUTO_INCREMENT = 1;`;
const AUTO_INCREMENT_MEAL = `ALTER TABLE meal AUTO_INCREMENT = 1;`;
const AUTO_INCREMENT_PARTICIPANTS = `ALTER TABLE meal_participants_user AUTO_INCREMENT = 1;`;
const INSERT_MEAL = `INSERT INTO meal (id, isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, cookId, name, description) VALUES (1, 1, 1, 1, 1, '2022-05-20 06:36:27', 6, 6.75, 'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg', 1, 'Spaghetti Bolognese', 'Dé pastaklassieker bij uitstek.')`;
const INSERT_MEAL2 = `INSERT INTO meal (id, isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, cookId, name, description) VALUES (2, 0, 0, 0, 0, '2022-06-20 06:36:27', 7, 7.75, 'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg', 2, 'Spaghetti Bolognese 2', 'Dé pastaklassieker bij uitstek 2.')`;

describe("UC-101: Login functionality different test cases, api/auth/login", () => {
  beforeEach((done) => {
    dbConnection.query(
      CLEAR_MEAL_TABLE +
        CLEAR_USER_TABLE +
        CLEAR_PARTICIPANT_TABLE +
        AUTO_INCREMENT_MEAL +
        AUTO_INCREMENT_USER +
        AUTO_INCREMENT_PARTICIPANTS +
        INSERT_USER,
      (err, result) => {
        if (err) {
          logger.error(err);
        }
        done();
      }
    );
  });
  

  describe("TC-101-1: required field missing", () => {
    it("When a required field is missing, a valid error should be returned", (done) => {
      chai
        .request(server)
        .post("/api/auth/login")
        .send({
          emailAdress: "",
          password: "testT2123",
        })
        .end((err, res) => {
          assert.ifError(err);
          res.should.be.a("object");
          let { message, status } = res.body;
          status.should.be.equal(400);
          message.should.be.eql("Email is invalid");

          done();
        });
    });
  });

  describe("TC-101-2: invalid e-mail adress", () => {
    it("When an invalid e-mail adress is given, a valid error should be returned", (done) => {
      chai
        .request(server)
        .post("/api/auth/login")
        .send({
          emailAdress: "test",
          password: "testT2123",
        })
        .end((err, res) => {
          assert.ifError(err);
          res.should.be.a("object");
          let { status, message } = res.body;
          status.should.be.eql(400);
          message.should.be.eql("Email is invalid");
          done();
        });
    });
  });

  describe("TC-101-3: invalid password", () => {
    it("When an invalid password is given, a valid error should be returned", (done) => {
      chai
        .request(server)
        .post("/api/auth/login")
        .send({
          emailAdress: "test@test.com",
          password: "test",
        })
        .end((err, res) => {
          assert.ifError(err);
          res.should.be.a("object");

          let { status, message } = res.body;
          status.should.be.eql(400);
          message.should.be.eql(
            "Password is invalid, min. 8 characters, 1 uppercase, 1 lowercase, 1 number"
          );
          done();
        });
    });
  });

  describe("TC-101-4: user does not exist", () => {
    it("When a user does not exist, a valid error should be returned", (done) => {
      chai
        .request(server)
        .post("/api/auth/login")
        .send({
          emailAdress: "test2@test.com",
          password: "testT2129",
        })
        .end((err, res) => {
          assert.ifError(err);
          res.should.be.a("object");
          let { status, result } = res.body;
          status.should.be.eql(404);
          result.should.be.eql("Email not found");
          done();
        });
      });
  });

  describe("TC-101-5: user logged in succesfully", () => {
    it("When a user logs in succesfully, a valid token should be returned", (done) => {
      chai
        .request(server)
        .post("/api/auth/login")
        .send({
          emailAdress: "test@test.com",	
          password: "testT2123",
        })
        .end((err, res) => {
          assert.ifError(err);
          res.should.be.a("object");
          let { status, result } = res.body;
          status.should.be.eql(201);
          result.should.have.property("id");
          result.should.have.property("firstName");
          result.should.have.property("lastName");
          result.should.have.property("emailAdress");
          result.should.have.property("token");
          done();
        });	
    });
  });
});
