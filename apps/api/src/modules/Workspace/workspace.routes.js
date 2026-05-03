const express = require("express");
const { WorkspaceController } = require("./workspace.controller");
const auth = require("../../middleware/auth");

const router = express.Router();

const actionItemRoutes = require("../ActionItem/action-item.routes");
const announcementRoutes = require("../Announcement/announcement.routes");

router.get("/", auth(), WorkspaceController.getAllWorkspaces);
router.post("/initialize", auth(), WorkspaceController.initializeDefaultWorkspace);
router.get("/:id", auth(), WorkspaceController.getWorkspaceById);
router.get("/:wsId/goals", auth(), WorkspaceController.getWorkspaceGoals);
router.post("/:wsId/goals", auth(), WorkspaceController.createGoal);
router.get("/:wsId/goals/:id", auth(), WorkspaceController.getGoalDetails);
router.patch("/:wsId/goals/:id", auth(), WorkspaceController.updateGoal);
router.delete("/:wsId/goals/:id", auth(), WorkspaceController.deleteGoal);

// Goal Updates (Activity Feed)
router.post("/:wsId/goals/:id/updates", auth(), WorkspaceController.createGoalUpdate);
router.patch("/:wsId/goals/:goalId/updates/:id", auth(), WorkspaceController.updateGoalUpdate);
router.delete("/:wsId/goals/:goalId/updates/:id", auth(), WorkspaceController.deleteGoalUpdate);

// Milestones
router.get("/:wsId/goals/:goalId/milestones", auth(), WorkspaceController.getGoalMilestones);
router.post("/:wsId/goals/:goalId/milestones", auth(), WorkspaceController.createMilestone);
router.patch("/:wsId/goals/:goalId/milestones/:id", auth(), WorkspaceController.updateMilestone);
router.delete("/:wsId/goals/:goalId/milestones/:id", auth(), WorkspaceController.deleteMilestone);

router.use("/:wsId/announcements", announcementRoutes);
router.use("/:wsId/action-items", actionItemRoutes);

router.get("/:wsId/members", auth(), WorkspaceController.getWorkspaceMembers);

module.exports = router;
