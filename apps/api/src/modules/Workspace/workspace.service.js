const prisma = require("../../lib/prisma");
const { logAction } = require("../AuditLog/audit-log.service");

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

const inviteMember = async (workspaceId, actorId, { email, role }) => {
  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  if (!workspace) throw new Error("Workspace not found");

  // In a real app, we would create a pending invitation record.
  const inviteLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/register?invite=${workspaceId}&email=${email}`;
  
  await logAction({
    action: "MEMBER_INVITED",
    entityType: "MEMBER",
    entityId: email,
    metadata: { email, role },
    actorId,
    workspaceId
  });

  try {
    await sendInviteEmail(email, workspace.name, inviteLink);
  } catch (error) {
    console.error("Email sending failed:", error);
    return { 
      success: true, 
      message: "Invitation logged (Email failed - check SMTP config)",
      inviteLink 
    };
  }
  
  return { success: true, message: "Invitation sent" };
};

const updateMemberRole = async (workspaceId, actorId, userId, role) => {
  const result = await prisma.workspaceMember.update({
    where: {
      userId_workspaceId: {
        userId,
        workspaceId,
      },
    },
    data: { role },
  });

  await logAction({
    action: "MEMBER_ROLE_UPDATED",
    entityType: "MEMBER",
    entityId: userId,
    metadata: { role },
    actorId,
    workspaceId
  });

  return result;
};

const removeMember = async (workspaceId, actorId, userId) => {
  const result = await prisma.workspaceMember.delete({
    where: {
      userId_workspaceId: {
        userId,
        workspaceId,
      },
    },
  });

  await logAction({
    action: "MEMBER_REMOVED",
    entityType: "MEMBER",
    entityId: userId,
    actorId,
    workspaceId
  });

  return result;
};

const blockMember = async (workspaceId, actorId, userId, isBlocked) => {
  const result = await prisma.workspaceMember.update({
    where: {
      userId_workspaceId: {
        userId,
        workspaceId,
      },
    },
    data: { isBlocked },
  });

  await logAction({
    action: isBlocked ? "MEMBER_BLOCKED" : "MEMBER_UNBLOCKED",
    entityType: "MEMBER",
    entityId: userId,
    actorId,
    workspaceId
  });

  return result;
};

const updateWorkspace = async (id, actorId, payload) => {
  const { name, description, accentColor } = payload;
  const result = await prisma.workspace.update({
    where: { id },
    data: { name, description, accentColor },
  });

  await logAction({
    action: "WORKSPACE_UPDATED",
    entityType: "WORKSPACE",
    entityId: id,
    metadata: payload,
    actorId,
    workspaceId: id
  });

  return result;
};

const deleteWorkspace = async (id, actorId) => {
  const result = await prisma.workspace.delete({
    where: { id },
  });

  await logAction({
    action: "WORKSPACE_DELETED",
    entityType: "WORKSPACE",
    entityId: id,
    actorId,
    workspaceId: id
  });

  return result;
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

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const itemsCompletedThisWeek = actionItems.filter(
    i => i.status === 'DONE' && new Date(i.updatedAt) >= oneWeekAgo
  ).length;

  const overdueActionItemsCount = actionItems.filter(
    i => i.dueDate && new Date(i.dueDate) < now && i.status !== 'DONE'
  ).length;

  const totalOverdueCount = goalStats.overdue + overdueActionItemsCount;

  // Weekly completion data for the last 6 weeks
  const weeklyCompletion = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - (i * 7));
    const start = new Date(d);
    start.setDate(start.getDate() - 7);
    const end = d;
    
    const count = goals.filter(g => 
      g.status === 'COMPLETED' && 
      new Date(g.updatedAt) >= start && 
      new Date(g.updatedAt) <= end
    ).length;
    
    weeklyCompletion.push({ 
      name: `Week ${6-i}`, 
      value: count 
    });
  }

  return {
    summary: [
      { label: 'Total Goals', value: goalStats.total, color: 'text-indigo-600' },
      { label: 'Completed This Week', value: itemsCompletedThisWeek, color: 'text-emerald-600' },
      { label: 'Overdue Items', value: totalOverdueCount, color: 'text-rose-600' },
      { label: 'Total Action Items', value: actionItemStats.total, color: 'text-blue-600' },
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
    weeklyCompletion,
    overdueGoals,
  };
};

const createGoal = async (workspaceId, actorId, payload) => {
  const data = {
    ...payload,
    workspaceId,
    ownerId: actorId,
  };

  if (data.dueDate) {
    data.dueDate = new Date(data.dueDate);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (data.dueDate < today) {
      throw new Error("Due date cannot be in the past");
    }
  }

  const result = await prisma.goal.create({
    data,
  });

  await logAction({
    action: "GOAL_CREATED",
    entityType: "GOAL",
    entityId: result.id,
    metadata: { title: result.title },
    actorId,
    workspaceId
  });

  return result;
};

const updateGoal = async (id, actorId, payload) => {
  const data = { ...payload };
  if (data.dueDate) {
    data.dueDate = new Date(data.dueDate);
  }
  const result = await prisma.goal.update({
    where: { id },
    data,
  });

  await logAction({
    action: "GOAL_UPDATED",
    entityType: "GOAL",
    entityId: id,
    metadata: data,
    actorId,
    workspaceId: result.workspaceId
  });

  return result;
};

const deleteGoal = async (id, actorId) => {
  const goal = await prisma.goal.findUnique({ where: { id } });
  if (!goal) throw new Error("Goal not found");

  const result = await prisma.goal.delete({
    where: { id },
  });

  await logAction({
    action: "GOAL_DELETED",
    entityType: "GOAL",
    entityId: id,
    metadata: { title: goal.title },
    actorId,
    workspaceId: goal.workspaceId
  });

  return result;
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
