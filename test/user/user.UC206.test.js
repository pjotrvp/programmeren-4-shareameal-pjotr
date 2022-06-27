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

describe("UC-206: Delete user, User controller /api/users/userId", () => {});

describe("TC-206-1: user does not exist", () => {});

describe("TC-206-2: not logged in", () => {});

describe("TC-206-3: actor is not owner", () => {});

describe("TC-206-4: user succesfully deleted", () => {});
