const prisma = require("../../lib/prisma");

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

const createActionItem = async (workspaceId, data) => {
  if (data.dueDate) {
    const dueDate = new Date(data.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dueDate < today) {
      throw new Error("Due date cannot be in the past");
    }
    data.dueDate = dueDate;
  }

  return await prisma.actionItem.create({
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
};

const updateActionItem = async (id, data) => {
  if (data.dueDate) {
    const dueDate = new Date(data.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dueDate < today) {
      throw new Error("Due date cannot be in the past");
    }
    data.dueDate = dueDate;
  }
  return await prisma.actionItem.update({
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
};

const deleteActionItem = async (id) => {
  return await prisma.actionItem.delete({
    where: { id },
  });
};

module.exports.ActionItemService = {
  getWorkspaceActionItems,
  createActionItem,
  updateActionItem,
  deleteActionItem,
};
