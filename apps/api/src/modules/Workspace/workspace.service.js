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

const { sendInviteEmail } = require("../../lib/mail");

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
    isBlocked: m.isBlocked,
    joinedAt: m.joinedAt,
    isOnline: global.isUserOnline ? global.isUserOnline(m.userId) : false,
  }));
};

const inviteMember = async (workspaceId, { email, role }) => {
  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  if (!workspace) throw new Error("Workspace not found");

  // In a real app, we would create a pending invitation record.
  // For this demo, we'll assume the user exists or will create an account.
  const inviteLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/register?invite=${workspaceId}&email=${email}`;
  
  try {
    await sendInviteEmail(email, workspace.name, inviteLink);
  } catch (error) {
    console.error("Email sending failed:", error);
    // In demo mode, we don't want to throw error if SMTP is not configured
    return { 
      success: true, 
      message: "Invitation logged (Email failed - check SMTP config)",
      inviteLink 
    };
  }
  
  return { success: true, message: "Invitation sent" };
};

const updateMemberRole = async (workspaceId, userId, role) => {
  return await prisma.workspaceMember.update({
    where: {
      userId_workspaceId: {
        userId,
        workspaceId,
      },
    },
    data: { role },
  });
};

const removeMember = async (workspaceId, userId) => {
  return await prisma.workspaceMember.delete({
    where: {
      userId_workspaceId: {
        userId,
        workspaceId,
      },
    },
  });
};

const blockMember = async (workspaceId, userId, isBlocked) => {
  return await prisma.workspaceMember.update({
    where: {
      userId_workspaceId: {
        userId,
        workspaceId,
      },
    },
    data: { isBlocked },
  });
};

const updateWorkspace = async (id, payload) => {
  const { name, description, accentColor } = payload;
  return await prisma.workspace.update({
    where: { id },
    data: { name, description, accentColor },
  });
};

const deleteWorkspace = async (id) => {
  return await prisma.workspace.delete({
    where: { id },
  });
};

const getWorkspaceAnalytics = async (workspaceId) => {
  const [goals, actionItems, members] = await Promise.all([
    prisma.goal.findMany({ where: { workspaceId } }),
    prisma.actionItem.findMany({ where: { workspaceId } }),
    prisma.workspaceMember.count({ where: { workspaceId } }),
  ]);

  const now = new Date();

  const goalStats = {
    total: goals.length,
    completed: goals.filter(g => g.status === 'COMPLETED').length,
    inProgress: goals.filter(g => g.status === 'IN_PROGRESS').length,
    notStarted: goals.filter(g => g.status === 'NOT_STARTED').length,
    overdue: goals.filter(g => g.dueDate && new Date(g.dueDate) < now && g.status !== 'COMPLETED').length,
  };

  const actionItemStats = {
    total: actionItems.length,
    done: actionItems.filter(i => i.status === 'DONE').length,
    inProgress: actionItems.filter(i => i.status === 'IN_PROGRESS').length,
    todo: actionItems.filter(i => i.status === 'TODO').length,
  };

  const overdueGoals = goals
    .filter(g => g.dueDate && new Date(g.dueDate) < now && g.status !== 'COMPLETED')
    .map(g => ({
      id: g.id,
      title: g.title,
      dueDate: g.dueDate,
      status: g.status,
    }))
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  return {
    summary: [
      { label: 'Total Goals', value: goalStats.total, color: 'text-indigo-600' },
      { label: 'Completed Goals', value: goalStats.completed, color: 'text-emerald-600' },
      { label: 'Action Items', value: actionItemStats.total, color: 'text-blue-600' },
      { label: 'Team Members', value: members, color: 'text-purple-600' },
    ],
    goalChart: [
      { name: 'Completed', value: goalStats.completed },
      { name: 'In Progress', value: goalStats.inProgress },
      { name: 'Not Started', value: goalStats.notStarted },
    ],
    actionItemChart: [
      { name: 'Done', value: actionItemStats.done },
      { name: 'In Progress', value: actionItemStats.inProgress },
      { name: 'Todo', value: actionItemStats.todo },
    ],
    overdueGoals,
  };
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

const createWorkspace = async (userId, payload) => {
  const { name, description, accentColor } = payload;
  return await prisma.workspace.create({
    data: {
      name,
      description,
      accentColor: accentColor || "#e94560",
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
