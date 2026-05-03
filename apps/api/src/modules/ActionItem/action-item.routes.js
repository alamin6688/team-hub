const express = require("express");
const { ActionItemController } = require("./action-item.controller");
const auth = require("../../middleware/auth");

const router = express.Router({ mergeParams: true });

router.get("/", auth(), ActionItemController.getWorkspaceActionItems);
router.post("/", auth(), ActionItemController.createActionItem);
router.patch("/:id", auth(), ActionItemController.updateActionItem);
router.delete("/:id", auth(), ActionItemController.deleteActionItem);

module.exports = router;
