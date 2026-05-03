const httpStatus = require("http-status");
const { WorkspaceService } = require("./workspace.service");
const prisma = require("../../lib/prisma");

const getAllWorkspaces = async (req, res, next) => {
  try {
    const result = await WorkspaceService.getAllWorkspaces(req.user.id);
    res.status(httpStatus.OK).json({
      success: true,
      message: "Workspaces fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getWorkspaceById = async (req, res, next) => {
  try {
    const result = await WorkspaceService.getWorkspaceById(req.params.id);
    res.status(httpStatus.OK).json({
      success: true,
      message: "Workspace fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getWorkspaceGoals = async (req, res, next) => {
  try {
    const result = await WorkspaceService.getWorkspaceGoals(req.params.wsId);
    res.status(httpStatus.OK).json({
      success: true,
      message: "Goals fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getWorkspaceAnnouncements = async (req, res, next) => {
  try {
    const result = await WorkspaceService.getWorkspaceAnnouncements(req.params.wsId);
    res.status(httpStatus.OK).json({
      success: true,
      message: "Announcements fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getWorkspaceActionItems = async (req, res, next) => {
  try {
    const result = await WorkspaceService.getWorkspaceActionItems(req.params.wsId);
    res.status(httpStatus.OK).json({
      success: true,
      message: "Action items fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getWorkspaceMembers = async (req, res, next) => {
  try {
    const result = await WorkspaceService.getWorkspaceMembers(req.params.wsId);
    res.status(httpStatus.OK).json({
      success: true,
      message: "Members fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const createGoal = async (req, res, next) => {
  try {
    const result = await WorkspaceService.createGoal(req.params.wsId, req.user.id, req.body);
    res.status(httpStatus.CREATED).json({
      success: true,
      message: "Goal created successfully",
      data: result,
    });
  } catch (error) {
    console.error("CREATE GOAL ERROR:", error);
    next(error);
  }
};

const updateGoal = async (req, res, next) => {
  try {
    const result = await WorkspaceService.updateGoal(req.params.id, req.user.id, req.body);
    res.status(httpStatus.OK).json({
      success: true,
      message: "Goal updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const deleteGoal = async (req, res, next) => {
  try {
    await WorkspaceService.deleteGoal(req.params.id, req.user.id);
    res.status(httpStatus.OK).json({
      success: true,
      message: "Goal deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const initializeDefaultWorkspace = async (req, res, next) => {
  try {
    const result = await WorkspaceService.initializeDefaultWorkspace(req.user.id, req.user.name);
    res.status(httpStatus.CREATED).json({
      success: true,
      message: "Default workspace initialized",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const createWorkspace = async (req, res, next) => {
  try {
    const result = await WorkspaceService.createWorkspace(req.user.id, req.body);
    res.status(httpStatus.CREATED).json({
      success: true,
      message: "Workspace created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getGoalDetails = async (req, res, next) => {
  try {
    const result = await WorkspaceService.getGoalDetails(req.params.id);
    res.status(httpStatus.OK).json({
      success: true,
      message: "Goal details fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const createGoalUpdate = async (req, res, next) => {
  try {
    const result = await WorkspaceService.createGoalUpdate(req.params.id, req.user.id, req.body);
    res.status(httpStatus.CREATED).json({
      success: true,
      message: "Goal update posted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getGoalMilestones = async (req, res, next) => {
  try {
    const result = await WorkspaceService.getGoalMilestones(req.params.goalId);
    res.status(httpStatus.OK).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const createMilestone = async (req, res, next) => {
  try {
    const result = await WorkspaceService.createMilestone(req.params.goalId, req.body);
    res.status(httpStatus.CREATED).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateMilestone = async (req, res, next) => {
  try {
    const result = await WorkspaceService.updateMilestone(req.params.id, req.body);
    res.status(httpStatus.OK).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const deleteMilestone = async (req, res, next) => {
  try {
    await WorkspaceService.deleteMilestone(req.params.id);
    res.status(httpStatus.OK).json({
      success: true,
      message: "Milestone deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const updateGoalUpdate = async (req, res, next) => {
  try {
    const result = await WorkspaceService.updateGoalUpdate(req.params.id, req.body);
    res.status(httpStatus.OK).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const deleteGoalUpdate = async (req, res, next) => {
  try {
    await WorkspaceService.deleteGoalUpdate(req.params.id);
    res.status(httpStatus.OK).json({
      success: true,
      message: "Goal update deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const inviteMember = async (req, res, next) => {
  try {
    const result = await WorkspaceService.inviteMember(req.params.id, req.user.id, req.body);
    res.status(httpStatus.OK).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateMemberRole = async (req, res, next) => {
  try {
    const result = await WorkspaceService.updateMemberRole(req.params.id, req.user.id, req.params.userId, req.body.role);
    res.status(httpStatus.OK).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const removeMember = async (req, res, next) => {
  try {
    await WorkspaceService.removeMember(req.params.id, req.user.id, req.params.userId);
    res.status(httpStatus.OK).json({
      success: true,
      message: "Member removed",
    });
  } catch (error) {
    next(error);
  }
};

const blockMember = async (req, res, next) => {
  try {
    const result = await WorkspaceService.blockMember(req.params.id, req.user.id, req.params.userId, req.body.isBlocked);
    res.status(httpStatus.OK).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateWorkspace = async (req, res, next) => {
  try {
    const workspaceId = req.params.id;
    const userId = req.user.id;

    // Check if user is admin
    const member = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } },
    });

    if (!member || member.role !== "ADMIN") {
      return res.status(httpStatus.FORBIDDEN).json({
        success: false,
        message: "Only admins can update workspace settings",
      });
    }

    const result = await WorkspaceService.updateWorkspace(workspaceId, userId, req.body);
    res.status(httpStatus.OK).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const deleteWorkspace = async (req, res, next) => {
  try {
    await WorkspaceService.deleteWorkspace(req.params.id, req.user.id);
    res.status(httpStatus.OK).json({
      success: true,
      message: "Workspace deleted",
    });
  } catch (error) {
    next(error);
  }
};

const getWorkspaceAnalytics = async (req, res, next) => {
  try {
    const result = await WorkspaceService.getWorkspaceAnalytics(req.params.wsId);
    res.status(httpStatus.OK).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports.WorkspaceController = {
  getAllWorkspaces,
  initializeDefaultWorkspace,
  createWorkspace,
  getWorkspaceById,
  getWorkspaceGoals,
  getGoalDetails,
  createGoal,
  updateGoal,
  deleteGoal,
  createGoalUpdate,
  updateGoalUpdate,
  deleteGoalUpdate,
  getGoalMilestones,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  getWorkspaceAnnouncements,
  getWorkspaceActionItems,
  getWorkspaceMembers,
  inviteMember,
  updateMemberRole,
  removeMember,
  blockMember,
  updateWorkspace,
  deleteWorkspace,
  getWorkspaceAnalytics,
};
