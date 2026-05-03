const prisma = require("../../lib/prisma");

const getWorkspaceAnnouncements = async (workspaceId) => {
  return await prisma.announcement.findMany({
    where: { workspaceId },
    include: {
      author: {
        select: { id: true, name: true, avatarUrl: true },
      },
      comments: {
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
        },
        orderBy: { createdAt: "asc" },
      },
      reactions: true,
    },
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
  });
};

const createAnnouncement = async (workspaceId, authorId, data) => {
  return await prisma.announcement.create({
    data: {
      ...data,
      workspaceId,
      authorId,
    },
    include: {
      author: {
        select: { id: true, name: true, avatarUrl: true },
      },
      comments: true,
      reactions: true,
    },
  });
};

const updateAnnouncement = async (id, data) => {
  return await prisma.announcement.update({
    where: { id },
    data,
    include: {
      author: {
        select: { id: true, name: true, avatarUrl: true },
      },
      comments: {
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
        },
      },
      reactions: true,
    },
  });
};

const addReaction = async (announcementId, userId, emoji) => {
  // Find if user already has a reaction for this announcement
  const existingReaction = await prisma.reaction.findFirst({
    where: {
      userId,
      announcementId,
    },
  });

  if (existingReaction) {
    if (existingReaction.emoji === emoji) {
      // Toggle off: same emoji clicked, so remove it
      await prisma.reaction.delete({
        where: { id: existingReaction.id },
      });
      return { removed: true, emoji };
    } else {
      // Switch: different emoji clicked, update existing one
      return await prisma.reaction.update({
        where: { id: existingReaction.id },
        data: { emoji },
      });
    }
  }

  // Create new reaction
  return await prisma.reaction.create({
    data: {
      userId,
      announcementId,
      emoji,
    },
  });
};

const addComment = async (announcementId, authorId, content) => {
  return await prisma.comment.create({
    data: {
      content,
      announcementId,
      authorId,
    },
    include: {
      author: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
  });
};

module.exports.AnnouncementService = {
  getWorkspaceAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  addReaction,
  addComment,
};
