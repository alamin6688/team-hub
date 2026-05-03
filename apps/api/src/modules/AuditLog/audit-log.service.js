const prisma = require("../../lib/prisma");

const logAction = async ({ action, entityType, entityId, metadata, actorId, workspaceId }) => {
  try {
    return await prisma.auditLog.create({
      data: {
        action,
        entityType,
        entityId,
        metadata,
        actorId,
        workspaceId,
      },
    });
  } catch (error) {
    console.error("Audit Log Error:", error);
    // We don't want to fail the main operation if audit logging fails
  }
};

const getWorkspaceAuditLogs = async (workspaceId, filters = {}) => {
  const { action, actorId, entityType, startDate, endDate } = filters;

  const where = {
    workspaceId,
  };

  if (action) where.action = action;
  if (actorId) where.actorId = actorId;
  if (entityType) where.entityType = entityType;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  return await prisma.auditLog.findMany({
    where,
    include: {
      actor: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

module.exports = {
  logAction,
  getWorkspaceAuditLogs,
};
