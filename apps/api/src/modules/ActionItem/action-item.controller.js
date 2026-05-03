const httpStatus = require("http-status");
const { ActionItemService } = require("./action-item.service");

const getWorkspaceActionItems = async (req, res, next) => {
  try {
    const result = await ActionItemService.getWorkspaceActionItems(req.params.wsId);
    res.status(httpStatus.OK).json({
      success: true,
      message: "Action items fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const createActionItem = async (req, res, next) => {
  try {
    const result = await ActionItemService.createActionItem(req.params.wsId, req.body);
    
    // Real-time update
    if (global.io) {
      global.io.to(req.params.wsId).emit("action-item-created", result);
    }

    res.status(httpStatus.CREATED).json({
      success: true,
      message: "Action item created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateActionItem = async (req, res, next) => {
  try {
    const result = await ActionItemService.updateActionItem(req.params.id, req.body);
    
    // Real-time update
    if (global.io) {
      global.io.to(req.params.wsId).emit("action-item-updated", result);
    }

    res.status(httpStatus.OK).json({
      success: true,
      message: "Action item updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const deleteActionItem = async (req, res, next) => {
  try {
    await ActionItemService.deleteActionItem(req.params.id);
    
    // Real-time update
    if (global.io) {
      global.io.to(req.params.wsId).emit("action-item-deleted", req.params.id);
    }

    res.status(httpStatus.OK).json({
      success: true,
      message: "Action item deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports.ActionItemController = {
  getWorkspaceActionItems,
  createActionItem,
  updateActionItem,
  deleteActionItem,
};
