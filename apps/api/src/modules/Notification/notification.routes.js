const express = require("express");
const prisma = require("../../lib/prisma");
const auth = require("../../middleware/auth");
const httpStatus = require("http-status");

const router = express.Router();

router.get("/", auth(), async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.status(httpStatus.OK).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/read-all", auth(), async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, read: false },
      data: { read: true },
    });
    res.status(httpStatus.OK).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
