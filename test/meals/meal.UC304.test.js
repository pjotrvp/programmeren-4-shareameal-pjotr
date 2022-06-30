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
const INSERT_MEAL = `INSERT INTO meal (isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, name, description) VALUES (1, 1, 1, 1, '2022-05-20 06:36:27', 6, 6.75, 'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg', 'Spaghetti Bolognese', 'Dé pastaklassieker bij uitstek.');`;
const INSERT_MEAL2 = `INSERT INTO meal (isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, name, description) VALUES (0, 0, 0, 0, '2022-06-20 06:36:27', 7, 7.75, 'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg', 'Spaghetti Bolognese 2', 'Dé pastaklassieker bij uitstek 2.');`;

describe("UC-304, get meal details, Meal Controller /api/meal", () => {
  beforeEach((done) => {
    dbConnection.query(
      CLEAR_MEAL_TABLE +
        CLEAR_USER_TABLE +
        CLEAR_PARTICIPANT_TABLE +
        AUTO_INCREMENT_MEAL +
        AUTO_INCREMENT_USER +
        AUTO_INCREMENT_PARTICIPANTS +
        INSERT_USER +
        INSERT_MEAL +
        INSERT_MEAL2,
      (err, result) => {
        if (err) {
          logger.error(err);
        }
        done();
      }
    );
  });

  describe("TC-304-1, Meal does not exist", () => {
    it("When a meal does not exist, a valid error should be returned", (done)=> {
      chai.request(server)
      .get("/api/meal/3")
      .set("Authorization", "Bearer " + jwt.sign({ id: 1 }, jwtSecretKey))
      .end((err, res) => {
        assert.ifError(err);
        res.should.be.a("object");
        let { status, message } = res.body;
        status.should.be.eql(404);
        message.should.be.eql("Meal with id: 3 not found!");
        done();
      })
    })
  });

  describe("TC-304-2, Return meal details", () => {
    it("When a meal exists, a valid meal details should be returned", (done)=> {
      chai.request(server)
      .get("/api/meal/1")
      .set("Authorization", "Bearer " + jwt.sign({ id: 1 }, jwtSecretKey))
      .end((err, res) => {
        assert.ifError(err);
        res.should.be.a("object");
        let { status, result } = res.body;
        status.should.be.eql(200);
        result.should.be.a("object");
        result.should.have.property("id");
        result.should.have.property("isActive");
        result.should.have.property("isVega");
        result.should.have.property("isVegan");
        result.should.have.property("isToTakeHome");
        result.should.have.property("dateTime");
        result.should.have.property("maxAmountOfParticipants");
        result.should.have.property("price");
        result.should.have.property("imageUrl");
        result.should.have.property("name");
        result.should.have.property("description");
        done();
      })
    })
  });
}); 