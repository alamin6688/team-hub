const prisma = require("../../lib/prisma");

const getAllWorkspaces = async (userId) => {
  return await prisma.workspace.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },
  });
};

const getWorkspaceById = async (id) => {
  return await prisma.workspace.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  });
};

const getWorkspaceGoals = async (workspaceId) => {
  return await prisma.goal.findMany({
    where: { workspaceId },
    include: {
      owner: {
        select: { name: true, avatarUrl: true },
      },
    },
  });
};

const getWorkspaceAnnouncements = async (workspaceId) => {
  return await prisma.announcement.findMany({
    where: { workspaceId },
    include: {
      author: {
        select: { name: true, avatarUrl: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

const getWorkspaceActionItems = async (workspaceId) => {
  return await prisma.actionItem.findMany({
    where: { workspaceId },
    include: {
      assignee: {
        select: { name: true, avatarUrl: true },
      },
    },
  });
};

const getWorkspaceMembers = async (workspaceId) => {
  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
  });

  return members.map(m => ({
    ...m.user,
    role: m.role,
    isOnline: true, // Mocked for now, integrate with Socket.io later
  }));
};

const createGoal = async (workspaceId, ownerId, payload) => {
  const data = {
    ...payload,
    workspaceId,
    ownerId,
  };

  if (data.dueDate) {
    data.dueDate = new Date(data.dueDate);
    
    // Logic check: Due date shouldn't be in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (data.dueDate < today) {
      throw new Error("Due date cannot be in the past");
    }
  }

  return await prisma.goal.create({
    data,
  });
};

const updateGoal = async (id, payload) => {
  const data = { ...payload };
  if (data.dueDate) {
    data.dueDate = new Date(data.dueDate);
  }
  return await prisma.goal.update({
    where: { id },
    data,
  });
};

const deleteGoal = async (id) => {
  return await prisma.goal.delete({
    where: { id },
  });
};

const initializeDefaultWorkspace = async (userId, name) => {
  return await prisma.workspace.create({
    data: {
      name: `${name || 'My'}'s Workspace`,
      members: {
        create: {
          userId,
          role: "ADMIN",
        },
      },
    },
  });
};

const getGoalDetails = async (id) => {
  return await prisma.goal.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, avatarUrl: true } },
      milestones: { orderBy: { createdAt: 'asc' } },
      updates: {
        include: { author: { select: { name: true, avatarUrl: true } } },
        orderBy: { createdAt: 'desc' },
      },
      actionItems: {
        include: { assignee: { select: { name: true, avatarUrl: true } } },
      },
    },
  });
};

const createGoalUpdate = async (goalId, authorId, payload) => {
  return await prisma.goalUpdate.create({
    data: {
      ...payload,
      goalId,
      authorId,
    },
    include: { author: { select: { name: true, avatarUrl: true } } },
  });
};

const getGoalMilestones = async (goalId) => {
  return await prisma.milestone.findMany({
    where: { goalId },
    orderBy: { createdAt: 'asc' },
  });
};

const createMilestone = async (goalId, payload) => {
  const data = {
    ...payload,
    goalId,
  };
  if (data.dueDate) {
    data.dueDate = new Date(data.dueDate);
  }
  return await prisma.milestone.create({
    data,
  });
};

const updateMilestone = async (id, payload) => {
  const data = { ...payload };
  if (data.dueDate) {
    data.dueDate = new Date(data.dueDate);
  }
  return await prisma.milestone.update({
    where: { id },
    data,
  });
};

const deleteMilestone = async (id) => {
  return await prisma.milestone.delete({
    where: { id },
  });
};

const updateGoalUpdate = async (id, payload) => {
  return await prisma.goalUpdate.update({
    where: { id },
    data: payload,
    include: { author: { select: { name: true, avatarUrl: true } } },
  });
};

const deleteGoalUpdate = async (id) => {
  return await prisma.goalUpdate.delete({
    where: { id },
  });
};

module.exports.WorkspaceService = {
  getAllWorkspaces,
  initializeDefaultWorkspace,
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
};
