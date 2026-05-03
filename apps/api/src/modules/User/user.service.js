const prisma = require("../../lib/prisma");

const updateProfile = async (userId, payload) => {
  const { name, bio } = payload;
  return await prisma.user.update({
    where: { id: userId },
    data: { name, bio },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      bio: true,
    },
  });
};

const updateAvatar = async (userId, avatarUrl) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
    },
  });
};

module.exports.UserService = {
  updateProfile,
  updateAvatar,
};
