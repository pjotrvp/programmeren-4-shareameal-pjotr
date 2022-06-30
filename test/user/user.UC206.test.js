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

describe("UC-206: Delete user, User controller /api/users/userId", () => {
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
    describe("TC-206-1: user does not exist", () => {
        it("When a user does not exist, a valid error should be returned", (done) => {
            chai
                .request(server)
                .delete("/api/users/0")
                .set("Authorization", "Bearer " + jwt.sign({ id: 1 }, jwtSecretKey))
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.be.a("object");
                    let { status, result } = res.body;
                    status.should.be.eql(404);
                    result.should.be.eql("User does not exist");
                    done();
                }
            );
        }
    );
    });

    describe("TC-206-2: not logged in", () => {
        it("When a user is not logged in, a valid error should be returned", (done) => {
            chai
                .request(server)
                .delete("/api/users/1")
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.be.a("object");
                    let { status, message } = res.body;
                    status.should.be.eql(401);
                    message.should.be.eql("Authorization header missing!");
                    done();
                }
            );
        }
    );
    });

    describe("TC-206-3: actor is not owner", () => {
        it("When a user is not the owner of the meal, a valid error should be returned", (done) => {
            chai
                .request(server)
                .delete("/api/users/1")
                .set("Authorization", "Bearer " + jwt.sign({ id: 2 }, jwtSecretKey))
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.be.a("object");
                    let { status, result } = res.body;
                    status.should.be.eql(403);
                    result.should.be.eql("You are not the owner of this user");
                    done();
                }
            );
        }
    );
    });

    describe("TC-206-4: user succesfully deleted", () => {
        xit("When a user is successfully deleted, a valid response should be returned", (done) => {
            chai
                .request(server)
                .delete("/api/users/1")
                .set("Authorization", "Bearer " + jwt.sign({ id: 1 }, jwtSecretKey))
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.be.a("object");
                    let { status, message } = res.body;
                    status.should.be.eql(200);
                    message.should.be.eql("User successfully deleted");
                    done();
                }
            );
        }
    );
    });
});


