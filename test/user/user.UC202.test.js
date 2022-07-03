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
const INSERT_USER2 = `INSERT INTO user (firstName, lastName, emailAdress, password, phoneNumber, street, city, isActive) VALUES ('test', 'test', 'test2@test.com', 'testT2123', '22345678', 'test', 'test', false);`;

describe("UC-202: View all users, User controller /api/users", () => {
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
    }
    );

    describe("TC-202-1: Show 0 users", () => {
        it("When there are no users, an empty list should be returned", (done) => {
            dbConnection.query(
                CLEAR_USER_TABLE,
            )
            chai.request(server)
                .get("/api/users")
                .set("Authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
                .send()
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.be.a("object");
                    let {status, result} = res.body;
                    status.should.equal(200);
                    result.should.be.eql([]);
                    done();
                })
                
            
        })
    });

    describe("TC-202-2: Show 2 users", () => {
        it("When there are 2 users, a list with 2 users should be returned", (done) => {
            chai.request(server)
            .get("/api/users")
            .set("Authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
            .send()
            .end((err, res) => {
                assert.ifError(err);
                let {status, result} = res.body;
                status.should.equal(200);
                result.should.be.a("array");
                result.length.should.be.eql(2);
                done();
        });
    });
});

    describe("TC-202-3: Show users with non-existing name search term", () => {
        it("When a non-existing name is searched, no users should be returned", (done) => {
            chai.request(server)
            .get("/api/users?firstName=Berlijn")
            .set("Authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
            .send()
            .end((err, res) => {
                assert.ifError(err);
                let {status, result} = res.body;
                status.should.equal(200);
                result.should.be.a("array");
                result.length.should.be.eql(0);
                done();
            });
        });
    });

    describe("TC-202-4: Show IsActive = false users", () => {
        it("When inActive users are requested, inactive users should be returned", (done) => {
            chai.request(server)
            .get("/api/users?isActive=false")
            .set("Authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
            .send()
            .end((err, res) => {
                assert.ifError(err);
                let {status, result} = res.body;
                status.should.equal(200);
                result.should.be.a("array");
                result.forEach(result => {
                    result.isActive.should.be.eql(false);
                });
                done();
            });
        });
    });

    describe("TC-202-5: Show IsActive = true users", () => {
        it("When active users are requested, active users should be returned", (done) => {
            chai.request(server)
            .get("/api/users?isActive=true")
            .set("Authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
            .send()
            .end((err, res) => {
                assert.ifError(err);
                let {status, result} = res.body;
                status.should.equal(200);
                result.should.be.a("array");
                result.forEach(result => {
                    result.isActive.should.be.eql(true);
                }
                
            );
            done();
        
        });
    });
});

    describe("TC-202-6: Search users by existing name", () => {
        it("When a name is searched, users with that name should be returned", (done) => {
            chai.request(server)
            .get("/api/users?firstName=test")
            .set("Authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
            .send()
            .end((err, res) => {
                assert.ifError(err);
                let {status, result} = res.body;
                status.should.equal(200);
                result.should.be.a("array");
                result.forEach(result => {
                    result.firstName.should.be.eql("test");
                }
                
            );
            done();
        
        });
    });
});

});

