const prisma = require("../../lib/prisma");
const { logAction } = require("../AuditLog/audit-log.service");

const getWorkspaceActionItems = async (workspaceId) => {
  return await prisma.actionItem.findMany({
    where: { workspaceId },
    include: {
      assignee: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
      goal: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

const createActionItem = async (workspaceId, actorId, data) => {
  if (data.dueDate && data.dueDate !== "") {
    const dueDate = new Date(data.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dueDate < today) {
      throw new Error("Due date cannot be in the past");
    }
    data.dueDate = dueDate;
  } else {
    data.dueDate = null;
  }

  if (data.assigneeId === "") {
    data.assigneeId = null;
  }
  if (data.goalId === "") {
    data.goalId = null;
  }

  const result = await prisma.actionItem.create({
    data: {
      ...data,
      workspaceId,
    },
    include: {
      assignee: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });

  await logAction({
    action: "TASK_CREATED",
    entityType: "TASK",
    entityId: result.id,
    metadata: { title: result.title },
    actorId,
    workspaceId
  });

  return result;
};

const updateActionItem = async (id, actorId, data) => {
  if (data.dueDate && data.dueDate !== "") {
    const dueDate = new Date(data.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dueDate < today) {
      throw new Error("Due date cannot be in the past");
    }
    data.dueDate = dueDate;
  } else {
    data.dueDate = null;
  }

  if (data.assigneeId === "") {
    data.assigneeId = null;
  }
  if (data.goalId === "") {
    data.goalId = null;
  }

  const result = await prisma.actionItem.update({
    where: { id },
    data,
    include: {
      assignee: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });

  await logAction({
    action: "TASK_UPDATED",
    entityType: "TASK",
    entityId: id,
    metadata: data,
    actorId,
    workspaceId: result.workspaceId
  });

  return result;
};

const deleteActionItem = async (id, actorId) => {
  const task = await prisma.actionItem.findUnique({ where: { id } });
  if (!task) throw new Error("Task not found");

  const result = await prisma.actionItem.delete({
    where: { id },
  });

  await logAction({
    action: "TASK_DELETED",
    entityType: "TASK",
    entityId: id,
    metadata: { title: task.title },
    actorId,
    workspaceId: task.workspaceId
  });

  return result;
};

module.exports.ActionItemService = {
  getWorkspaceActionItems,
  createActionItem,
  updateActionItem,
  deleteActionItem,
};
