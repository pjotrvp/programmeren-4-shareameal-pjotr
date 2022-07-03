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
const INSERT_MEAL = `INSERT INTO meal (isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, name, description, cookId) VALUES (1, 1, 1, 1, '2022-05-20 06:36:27', 6, 6.75, 'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg', 'Spaghetti Bolognese', 'Dé pastaklassieker bij uitstek.', 1);`;
const INSERT_MEAL2 = `INSERT INTO meal (isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, name, description, cookid) VALUES (0, 0, 0, 0, '2022-06-20 06:36:27', 7, 7.75, 'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg', 'Spaghetti Bolognese 2', 'Dé pastaklassieker bij uitstek 2.', 2);`;

describe("UC-302, Update meal, Meal Controller /api/meal/:mealId", () => {
    beforeEach((done) => {
            dbConnection.query(
              CLEAR_MEAL_TABLE +
                CLEAR_USER_TABLE +
                CLEAR_PARTICIPANT_TABLE +
                AUTO_INCREMENT_MEAL +
                AUTO_INCREMENT_USER +
                AUTO_INCREMENT_PARTICIPANTS +
                INSERT_USER+ 
                INSERT_MEAL+
                INSERT_MEAL2,
              (err, result) => {
                if (err) {
                  logger.error(err);
                }
                done();
              }
            );
    })
    describe("TC-302-1 Required fiels missing", () => {
        it("When a required field is missing, a valid error should be returned", (done) => {
            chai
              .request(server)
              .put("/api/meal/1")
              .set(
                "Authorization",
                "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey)
              )
              .send({
                isActive: 1,
                isVega: 1,
                isVegan: 0,
                // isToTakeHome is missing
                dateTime: "2022-05-20 06:36:27",
                maxAmountOfParticipants: 6,
                price: 6.75,
                imageUrl:
                  "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                cookId: 1,
                name: "Spaghetti Bolognese",
                description: "Dé pastaklassieker bij uitstek.",
              })
              .end((err, res) => {
                assert.ifError(err);
                res.should.be.a("object");
                let { status, message } = res.body;
                status.should.be.eql(400);
                message.should.be.eql("isToTakeHome cannot be null");
                done();
              });
        })
    })

      describe("TC-302-2 User not logged in", () => {
        it("When the user is not logged in, a valid error should be returned", (done) => {
          chai
            .request(server)
            .put("/api/meal/1")
            .send({
              isActive: 1,
              isVega: 1,
              isVegan: 0,
              isToTakeHome: 1,
              dateTime: "2022-05-20 06:36:27",
              maxAmountOfParticipants: 6,
              price: 6.75,
              imageUrl:
                "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
              cookId: 1,
              name: "Spaghetti Bolognese",
              description: "Dé pastaklassieker bij uitstek.",
            })
            .end((err, res) => {
              assert.ifError(err);
              res.should.be.a("object");
              let { status, message } = res.body;
              status.should.be.eql(401);
              message.should.be.eql("Authorization header missing!");
              done();
            });
        });
      });

      describe("TC-302-3 User is not owner of the meal", () => {
        it("When a user is not authorized to update a meal, a valid error should be returned", (done) => {
          chai
            .request(server)
            .put("/api/meal/1")
            .set(
              "Authorization",
              "Bearer " + jwt.sign({ userId: 3 }, jwtSecretKey)
            )
            .send({
              isActive: 1,
              isVega: 1,
              isVegan: 0,
              isToTakeHome: 1,
              dateTime: "2022-05-20 06:36:27",
              maxAmountOfParticipants: 6,
              price: 6.75,
              imageUrl:
                "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
              cookId: 1,
              name: "Spaghetti Bolognese",
              description: "Dé pastaklassieker bij uitstek.",
            })
            .end((err, res) => {
              assert.ifError(err);
              res.should.be.a("object");
              let { status, result } = res.body;
              status.should.be.eql(403);
              result.should.be.eql("You are not the owner of this meal");
              done();
            });
        });
      });

      describe("TC-302-4 Meal does not exist", () => {
        it("When a meal does not exist, a valid error should be returned", (done) => {
          chai
            .request(server)
            .put("/api/meal/3")
            .set(
              "Authorization",
              "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey)
            )
            .send({
              isActive: 1,
              isVega: 1,
              isVegan: 0,
              isToTakeHome: 1,
              dateTime: "2022-05-20 06:36:27",
              maxAmountOfParticipants: 6,
              price: 6.75,
              imageUrl:
                "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
              cookId: 1,
              name: "Spaghetti Bolognese",
              description: "Dé pastaklassieker bij uitstek.",
            })
            .end((err, res) => {
              assert.ifError(err);
              res.should.be.a("object");
              let { status, result } = res.body;
              status.should.be.eql(404);
              result.should.be.eql("Meal does not exist");
              done();
            });
        });
      });

        describe("TC-302-5 Update meal", () => {
            it("When a meal is updated, a valid response should be returned", (done) => {
                chai
                .request(server)
                .put("/api/meal/1")
                .set(
                    "Authorization",
                    "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey)
                )
                .send({
                    isActive: 1,
                    isVega: 1,
                    isVegan: 0,
                    isToTakeHome: 1,
                    dateTime: "2022-05-20 06:36:27",
                    maxAmountOfParticipants: 6,
                    price: 6.75,
                    imageUrl:
                    "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                    cookId: 1,
                    name: "Spaghetti Bolognese",
                    description: "Dé pastaklassieker bij uitstek.",
                })
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.be.a("object");
                    let { status, result } = res.body;
                    status.should.be.eql(200);
                    result.should.have.property("isActive");
                    result.should.have.property("isVega");
                    result.should.have.property("isVegan");
                    result.should.have.property("isToTakeHome");
                    result.should.have.property("dateTime");
                    result.should.have.property("maxAmountOfParticipants");
                    result.should.have.property("price");
                    result.should.have.property("imageUrl");
                    result.should.have.property("cookId");
                    result.should.have.property("name");
                    result.should.have.property("description");
                    done();
                });
            });
            });
});