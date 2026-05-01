const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../../lib/prisma");

const register = async (userData) => {
  const { email, password, name } = userData;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
    },
  });

  return user;
};

const login = async (loginData) => {
  const { email, password } = loginData;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    throw new Error("Invalid credentials or account deactivated");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  const accessToken = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_ACCESS_SECRET || "access_secret",
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_REFRESH_SECRET || "refresh_secret",
    { expiresIn: "7d" }
  );

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
    },
  };
};

const refreshToken = async (token) => {
  if (!token) throw new Error("Refresh token required");

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || "refresh_secret");
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user || !user.isActive) throw new Error("User not found or deactivated");

    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_ACCESS_SECRET || "access_secret",
      { expiresIn: "15m" }
    );

    return { accessToken };
  } catch (error) {
    throw new Error("Invalid refresh token");
  }
};

module.exports.AuthService = {
  register,
  login,
  refreshToken,
};
