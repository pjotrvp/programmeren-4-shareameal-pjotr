process.env.DB_DATABASE = process.env.DB_DATABASE || "sharemealtestdb";
process.env.LOGGER = "warn";

const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../index");
const assert = require("assert");
require("dotenv").config();
const dbconnection = require("../../database/dbconnection");
const jwt = require("jsonwebtoken");
const { jwtSecretKey, logger } = require("../../config/config");

chai.should();
chai.use(chaiHttp);

const CLEAR_MEAL_TABLE = `DELETE IGNORE FROM meal;`;
const CLEAR_PARTICIPANT_TABLE = `DELETE IGNORE FROM meal_participants_user;`;
const CLEAR_USER_TABLE = `DELETE IGNORE FROM user;`;
const INSERT_USER = `INSERT INTO user (firstName, lastName, emailAdress, password, phoneNumber, street, city, isActive) VALUES ('test', 'test', 'test@test.com', 'testT2123', '12345678', 'test', 'test', true);`;
const AUTO_INCREMENT_USER = `ALTER TABLE user AUTO_INCREMENT = 1;`;
const AUTO_INCREMENT_MEAL = `ALTER TABLE meal AUTO_INCREMENT = 1;`;
const AUTO_INCREMENT_PARTICIPANTS = `ALTER TABLE meal_participants_user AUTO_INCREMENT = 1;`;
const INSERT_USER2 = `INSERT INTO user (firstName, lastName, emailAdress, password, phoneNumber, street, city, isActive) VALUES ('test', 'test', 'test2@test.com', 'testT2123', '22345678', 'test', 'test', true);`;

describe("UC-201: Register users, User Controller /api/user", () => {
  beforeEach((done) => {
    dbconnection.query(
      CLEAR_MEAL_TABLE +
        CLEAR_USER_TABLE +
        CLEAR_PARTICIPANT_TABLE +
        AUTO_INCREMENT_MEAL +
        AUTO_INCREMENT_USER +
        AUTO_INCREMENT_PARTICIPANTS +
        INSERT_USER +
        INSERT_USER2,
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
        .post("/api/user")
        .set("Authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
        .send({
          firstName: "John",
          lastName: "Doe",
          // emailAdress is missing
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
          status.should.be.eql(400);
          result.should.be.eql("Email is required");
          done();
        });
    });
  });
});

describe("TC-201-2 invalid Email", () => {
  it("When an invalid email is registered, a valid error should be returned", (done) => {
    chai
      .request(server)
      .post("/api/user")
      .set("Authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
      .send({
        firstName: "John",
        lastName: "Doe",
        emailAdress: "Paris",
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
        status.should.be.eql(400);
        result.should.be.eql("Email is invalid");
        done();
      });
  });
});

describe("TC-201-1: Field is missing", () => {
  it("When a required field is missing, a valid error should be returned", (done) => {
    chai
      .request(server)
      .post("/api/user")
      .set("Authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
      .send({
        firstName: "John",
        lastName: "Doe",
        // emailAdress is missing
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
        status.should.be.eql(400);
        result.should.be.eql("Email is required");
        done();
      });
  });
});

describe("TC-201-3 invalid Password", () => {
  it("When an invalid password is registered, a valid error should be returned", (done) => {
    chai
      .request(server)
      .post("/api/user")
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
        result.should.be.eql("password is invalid");
        done();
      });
  });
});

describe("TC-201-4 User already exists", () => {
  it("When a user already exists, a valid error should be returned", (done) => {
    chai
      .request(server)
      .post("/api/user")
      .set("Authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
      .send({
        firstName: "John",
        lastName: "Doe",
        emailAdress: "test2@test.com",
        password: "223456Abc",
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
        result.should.be.eql(
          `The email-address: ${user.emailAdress} has already been taken!`
        );
        done();
      });
  });
});

describe("TC-201-5 Succesfully registered", () => {
  it("When an user logs in correctly, user should be returned", (done) => {
    chai
      .request(server)
      .post("/api/user")
      .set("Authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
      .send({
        firstName: "John",
        lastName: "Doe",
        emailAdress: "test@test.com",
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
        status.should.be.eql(200);
        result.should.be.eql({ user, token });
        done();
      });
  });
});
