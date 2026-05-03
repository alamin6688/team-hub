const httpStatus = require("http-status");
const { AuthService } = require("./auth.service");

const register = async (req, res, next) => {
  try {
    const result = await AuthService.register(req.body);
    res.status(httpStatus.CREATED).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { accessToken, refreshToken, user } = await AuthService.login(req.body);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(httpStatus.OK).json({
      success: true,
      message: "Login successful",
      data: { accessToken, user },
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  res.clearCookie("refreshToken");
  res.status(httpStatus.OK).json({
    success: true,
    message: "Logged out successfully",
  });
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    const result = await AuthService.refreshToken(refreshToken);
    res.status(httpStatus.OK).json({
      success: true,
      message: "Token refreshed successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await AuthService.getUserById(req.user.id);
    res.status(httpStatus.OK).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports.AuthController = {
  register,
  login,
  logout,
  refreshToken,
  getMe,
};
