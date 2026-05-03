const express = require("express");
const { AnnouncementController } = require("./announcement.controller");
const auth = require("../../middleware/auth");

const router = express.Router({ mergeParams: true });

router.get("/", auth(), AnnouncementController.getWorkspaceAnnouncements);
router.post("/", auth(), AnnouncementController.createAnnouncement);
router.patch("/:id", auth(), AnnouncementController.updateAnnouncement);
router.post("/:id/reactions", auth(), AnnouncementController.addReaction);
router.post("/:id/comments", auth(), AnnouncementController.addComment);

module.exports = router;
