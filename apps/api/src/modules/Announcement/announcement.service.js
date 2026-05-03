const prisma = require("../../lib/prisma");
const { logAction } = require("../AuditLog/audit-log.service");

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

const createAnnouncement = async (workspaceId, actorId, data) => {
  const result = await prisma.announcement.create({
    data: {
      ...data,
      workspaceId,
      authorId: actorId,
    },
    include: {
      author: {
        select: { id: true, name: true, avatarUrl: true },
      },
      comments: true,
      reactions: true,
    },
  });

  await logAction({
    action: "ANNOUNCEMENT_CREATED",
    entityType: "ANNOUNCEMENT",
    entityId: result.id,
    metadata: { title: result.title },
    actorId,
    workspaceId
  });

  return result;
};

const updateAnnouncement = async (id, actorId, data) => {
  const result = await prisma.announcement.update({
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

  await logAction({
    action: "ANNOUNCEMENT_UPDATED",
    entityType: "ANNOUNCEMENT",
    entityId: id,
    metadata: data,
    actorId,
    workspaceId: result.workspaceId
  });

  return result;
};

const deleteAnnouncement = async (id, actorId) => {
  const announcement = await prisma.announcement.findUnique({ where: { id } });
  if (!announcement) throw new Error("Announcement not found");

  const result = await prisma.announcement.delete({
    where: { id },
  });

  await logAction({
    action: "ANNOUNCEMENT_DELETED",
    entityType: "ANNOUNCEMENT",
    entityId: id,
    metadata: { title: announcement.title },
    actorId,
    workspaceId: announcement.workspaceId
  });

  return result;
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
  // 1. Create the comment
  const comment = await prisma.comment.create({
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

  // 2. Parse @mentions from the comment text (e.g. "@John Doe" or "@Jane")
  const mentionRegex = /@([\w\s]+?)(?=\s@|\s*$|[^a-zA-Z\s])/g;
  const rawMentions = [...content.matchAll(mentionRegex)].map((m) =>
    m[1].trim().toLowerCase()
  );

  const notifiedUsers = [];

  if (rawMentions.length > 0) {
    // 3. Get the announcement to find its workspaceId
    const announcement = await prisma.announcement.findUnique({
      where: { id: announcementId },
      select: { workspaceId: true },
    });

    if (announcement) {
      // 4. Find workspace members whose names match any mention
      const workspaceMembers = await prisma.workspaceMember.findMany({
        where: { workspaceId: announcement.workspaceId },
        include: {
          user: { select: { id: true, name: true } },
        },
      });

      for (const member of workspaceMembers) {
        // Skip the author themselves
        if (member.user.id === authorId) continue;

        const memberNameLower = member.user.name.toLowerCase();
        const isMentioned = rawMentions.some(
          (mention) =>
            memberNameLower === mention ||
            memberNameLower.startsWith(mention) ||
            mention.startsWith(memberNameLower)
        );

        if (isMentioned) {
          // 5. Create notification record
          await prisma.notification.create({
            data: {
              type: "MENTION",
              message: `${comment.author.name} mentioned you in a comment: "${content.substring(0, 60)}${content.length > 60 ? '...' : ''}"`,
              userId: member.user.id,
              link: `/dashboard/announcements`,
            },
          });
          notifiedUsers.push(member.user.id);
        }
      }
    }
  }

  return { comment, notifiedUsers };
};

module.exports.AnnouncementService = {
  getWorkspaceAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  addReaction,
  addComment,
};
