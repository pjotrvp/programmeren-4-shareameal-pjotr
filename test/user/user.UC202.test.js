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

describe("UC-202: View all users, User controller /api/users", () => {});

describe("TC-202-1: Show 0 users", () => {});

describe("TC-202-2: Show 2 users", () => {});

describe("TC-202-3: Show users with non-existing search term", () => {});

describe("TC-202-4: Show IsActive = false users", () => {});

describe("TC-202-5: Show IsActive = true users", () => {});

describe("TC-202-6: Search users by existing name", () => {});
