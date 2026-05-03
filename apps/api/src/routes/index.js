const express = require("express");
const authRoutes = require("../modules/Auth/auth.routes");
const workspaceRoutes = require("../modules/Workspace/workspace.routes");
const notificationRoutes = require("../modules/Notification/notification.routes");

const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: authRoutes,
  },
  {
    path: "/workspaces",
    route: workspaceRoutes,
  },
  {
    path: "/notifications",
    route: notificationRoutes,
  },
  {
    path: "/users",
    route: require("../modules/User/user.routes"),
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

module.exports = router;
