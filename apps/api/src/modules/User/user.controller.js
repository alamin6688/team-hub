const httpStatus = require("http-status");
const { UserService } = require("./user.service");

const updateProfile = async (req, res, next) => {
  try {
    const result = await UserService.updateProfile(req.user.id, req.body);
    res.status(httpStatus.OK).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "No image file provided",
      });
    }
    const result = await UserService.updateAvatar(req.user.id, req.file.path);
    res.status(httpStatus.OK).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports.UserController = {
  updateProfile,
  updateAvatar,
};
