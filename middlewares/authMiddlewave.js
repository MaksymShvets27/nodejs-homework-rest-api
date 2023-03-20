const jwt = require("jsonwebtoken");
const User = require("../models/usersModel");
const { catchAsync, AppError } = require("../service");

exports.protect = catchAsync(async (req, res, next) => {
  const token =
    req.headers.authorization?.startsWith("Bearer") &&
    req.headers.authorization.split(" ")[1];

  if (!token) return next(new AppError(401, "Not authorized1"));

  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  const currentUser = await User.findById(decodedToken);

  if (!currentUser) return next(new AppError(401, "Not authorized2"));

  req.user = currentUser;

  next();
});
