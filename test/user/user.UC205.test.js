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

describe("UC-205: Update user, User controller /api/users/userId", () => {
           beforeEach((done) => {
             dbConnection.query(
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

    describe("TC-205-1: Required field, Email adress missing", () => {
        it("When the email adress is missing, a valid error should be returned", (done) => {
            chai
              .request(server)
              .put("/api/users/1")
              .set(
                "Authorization",
                "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey)
              )
              .send({
                firstName: "John",
                lastName: "Doe",
                //emailAdress: "",
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
        })
    });

    describe("TC-205-3: invalid PhoneNumber", () => {
      it("When an invalid phone number is provided, a valid error should be returned", (done) => {
        chai
        .request(server)
        .put("/api/users/1")
        .set(
          "Authorization",
          "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey)
        )
        .send({
          firstName: "John",
          lastName: "Doe",
          emailAdress: "test@test.com",
          password: "testT2123",
          phoneNumber: "1234567",
          street: "street",
          city: "city",
          isActive: true,
      })
      .end((err, res) => {
        assert.ifError(err);
        res.should.be.a("object");
        let { status, result } = res.body;
        status.should.be.eql(400);
        result.should.be.eql("Phone number is invalid");
        done();
      });
    });
  });
    describe("TC-205-4: user does not exist", () => {
        it("When the user does not exist, a valid error should be returned", (done) => {
            chai
              .request(server)
              .put("/api/users/3")
              .set(
                "Authorization",
                "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey)
              )
              .send({
                firstName: "John",
                lastName: "Doe",
                emailAdress: "nonexisting@test.com",
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
                status.should.be.eql(404);
                result.should.be.eql("User does not exist");
                done();
              });
        })
    });

    describe("TC-205-5: Not logged in", () => {
        it("When the user is not logged in, a valid error should be returned", (done) => {
            chai
              .request(server)
              .put("/api/users/1")
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
                let { status, message } = res.body;
                status.should.be.eql(401);
                message.should.be.eql("Authorization header missing!");
                done();
              }
            );
        });
    });

    describe("TC-205-6: user succesfully updated", () => {
        it("When the user is successfully updated, a valid response should be returned", (done) => {
            chai
              .request(server)
              .put("/api/users/1")
              .set(
                "Authorization",
                "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey)
              )
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
                status.should.be.eql(200);
                result.should.have.property("firstName");
                result.should.have.property("lastName");
                result.should.have.property("emailAdress");
                result.should.have.property("password");
                result.should.have.property("phoneNumber");
                result.should.have.property("street");
                result.should.have.property("city");
                result.should.have.property("isActive");
                done();
              }
            );
        });
    });
});


