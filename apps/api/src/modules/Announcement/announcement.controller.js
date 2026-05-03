const httpStatus = require("http-status");
const { AnnouncementService } = require("./announcement.service");

const getWorkspaceAnnouncements = async (req, res, next) => {
  try {
    const result = await AnnouncementService.getWorkspaceAnnouncements(req.params.wsId);
    res.status(httpStatus.OK).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const createAnnouncement = async (req, res, next) => {
  try {
    const result = await AnnouncementService.createAnnouncement(req.params.wsId, req.user.id, req.body);
    
    if (global.io) {
      global.io.to(req.params.wsId).emit("announcement-created", result);
    }

    res.status(httpStatus.CREATED).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateAnnouncement = async (req, res, next) => {
  try {
    const result = await AnnouncementService.updateAnnouncement(req.params.id, req.body);
    
    if (global.io) {
      global.io.to(req.params.wsId).emit("announcement-updated", result);
    }

    res.status(httpStatus.OK).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const addReaction = async (req, res, next) => {
  try {
    const result = await AnnouncementService.addReaction(req.params.id, req.user.id, req.body.emoji);
    
    if (global.io) {
      global.io.to(req.params.wsId).emit("announcement-reaction-updated", { 
        announcementId: req.params.id, 
        userId: req.user.id,
        result 
      });
    }

    res.status(httpStatus.OK).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const addComment = async (req, res, next) => {
  try {
    const result = await AnnouncementService.addComment(req.params.id, req.user.id, req.body.content);
    
    if (global.io) {
      global.io.to(req.params.wsId).emit("announcement-comment-added", { 
        announcementId: req.params.id, 
        comment: result 
      });
    }

    res.status(httpStatus.CREATED).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports.AnnouncementController = {
  getWorkspaceAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  addReaction,
  addComment,
};
