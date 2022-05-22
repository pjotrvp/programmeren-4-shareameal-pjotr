const express = require("express");
const participantRoutes = express.Router({ mergeParams: true });
const participantController = require("../controllers/participant.controller");

participantRoutes.put("/:participantId", participarticipantController.update);
participantRoutes.post("/", participantController.create);
participantRoutes.get("/", participantController.findAll);
participantRoutes.get("/:participantId", participantController.findOne);
participantRoutes.delete("/:participantId", participantController.remove);

module.exports = participantRoutes;
