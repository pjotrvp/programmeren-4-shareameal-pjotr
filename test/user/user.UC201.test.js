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
const INSERT_USER = `INSERT INTO user (firstName, lastName, emailAdress, password, phoneNumber, street, city, isActive) VALUES ('test', 'test', 'test@test.com', '${bcrypt.hashSync(
  "testT2123",
  salt
)}', '12345678', 'test', 'test', true);`;
const AUTO_INCREMENT_USER = `ALTER TABLE user AUTO_INCREMENT = 1;`;
const AUTO_INCREMENT_MEAL = `ALTER TABLE meal AUTO_INCREMENT = 1;`;
const AUTO_INCREMENT_PARTICIPANTS = `ALTER TABLE meal_participants_user AUTO_INCREMENT = 1;`;

describe("UC-201: Register users, User Controller /api/user", () => {
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

  describe("TC-201-1: Field is missing", () => {
    it("When a required field is missing, a valid error should be returned", (done) => {
      chai
        .request(server)
        .post("/api/users")
        .set("Authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
        .send({
          firstName: "John",
          lastName: "Doe",
          // emailAdress is missing
          password: "testT2123",
          phoneNumber: "0612345678",
          street: "street",
          city: "city",
          isActive: true,
        })
        .end((err, res) => {
          assert.ifError(err);
          res.should.be.a("object");
          let { status, result } = res.body;
          status.should.be.eql(400);
          result.should.be.eql("Email is required");
          done();
        });
    });
  });

  describe("TC-201-2 invalid Email", () => {
    it("When an invalid email is registered, a valid error should be returned", (done) => {
      chai
        .request(server)
        .post("/api/users")
        .set("Authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
        .send({
          firstName: "John",
          lastName: "Doe",
          emailAdress: "Paris",
          password: "testT2123",
          phoneNumber: "0612345678",
          street: "street",
          city: "city",
          isActive: true,
        })
        .end((err, res) => {
          assert.ifError(err);
          res.should.be.a("object");
          let { status, result } = res.body;
          status.should.be.eql(400);
          result.should.be.eql("Email is invalid");
          done();
        });
    });
  });

  describe("TC-201-3 invalid Password", () => {
    it("When an invalid password is registered, a valid error should be returned", (done) => {
      chai
        .request(server)
        .post("/api/users")
        .set("Authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
        .send({
          firstName: "John",
          lastName: "Doe",
          emailAdress: "test@test.com",
          password: "6",
          phoneNumber: "0612345678",
          street: "street",
          city: "city",
          isActive: true,
        })
        .end((err, res) => {
          assert.ifError(err);
          res.should.be.a("object");
          let { status, result } = res.body;
          status.should.be.eql(400);
          result.should.be.eql(
            "Password is invalid, min. 8 characters, 1 uppercase, 1 lowercase, 1 number"
          );
          done();
        });
    });
  });

  describe("TC-201-4 User already exists", () => {
    it("When a user already exists, a valid error should be returned", (done) => {
      chai
        .request(server)
        .post("/api/users")
        .set("Authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
        .send({
          firstName: "John",
          lastName: "Doe",
          emailAdress: "test@test.com",
          password: "testT2123",
          phoneNumber: "0612345678",
          street: "street",
          city: "city",
          isActive: true,
        })
        .end((err, res) => {
          assert.ifError(err);
          res.should.be.a("object");
          let { status, result } = res.body;
          status.should.be.eql(409);
          result.should.be.eql("User already exists");
          done();
        });
    });
  });

  describe("TC-201-5 Succesfully registered", () => {
    it("When a user is registered succesfully, user should be returned", (done) => {
      chai
        .request(server)
        .post("/api/users")
        .set("Authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
        .send({
          firstName: "John",
          lastName: "Doe",
          emailAdress: "test3@test.com",
          password: "123456Abc",
          phoneNumber: "0612345678",
          street: "street",
          city: "city",
          isActive: true,
        })
        .end((err, res) => {
          assert.ifError(err);
          res.should.be.a("object");
          let { status, result } = res.body;
          status.should.be.eql(201);
          result.should.have.property("firstName");
          result.should.have.property("lastName");
          result.should.have.property("isActive");
          result.should.have.property("emailAdress");
          result.should.have.property("password");
          result.should.have.property("phoneNumber");
          result.should.have.property("street");
          result.should.have.property("city");
          done();
        });
    });
  });
});
