const express = require("express");
const { getAuditLogs, exportAuditLogsCSV } = require("./audit-log.controller");
const auth = require("../../middleware/auth");

const router = express.Router({ mergeParams: true });

// Routes are mounted at /workspaces/:workspaceId/audit-logs
router.get("/", auth(), getAuditLogs);
router.get("/export", auth(), exportAuditLogsCSV);

module.exports = router;
