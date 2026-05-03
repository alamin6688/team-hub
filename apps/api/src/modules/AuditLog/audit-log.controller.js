const { getWorkspaceAuditLogs } = require("./audit-log.service");

const getAuditLogs = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const logs = await getWorkspaceAuditLogs(workspaceId, req.query);
    res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

const exportAuditLogsCSV = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const logs = await getWorkspaceAuditLogs(workspaceId, req.query);

    // CSV Headers
    const headers = ["Timestamp", "Actor", "Action", "Entity Type", "Entity ID", "Details"];
    const rows = logs.map(log => [
      new Date(log.createdAt).toISOString(),
      log.actor.name,
      log.action,
      log.entityType,
      log.entityId,
      log.metadata ? JSON.stringify(log.metadata).replace(/"/g, '""') : ""
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=audit-log-${workspaceId}-${Date.now()}.csv`);
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAuditLogs,
  exportAuditLogsCSV,
};
