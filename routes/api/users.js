const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();
const authMiddlewave = require("../../middlewares/authMiddlewave");
const { uploadUserPhoto } = require("../../middlewares/uploadUserPhoto");

const User = require("../../models/usersModel");
const ImageService = require("../../service/imageService");
const {
  validateAuth,
  catchAsync,
  AppError,
} = require("../../service/index.js");

router.post(
  "/register",
  catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    const validateResult = validateAuth(req.body);
    if (!validateResult.status) {
      return next(new AppError(400, validateResult.error));
    }

    const userExists = await User.exists({ email });
    if (userExists)
      return next(new AppError(409, "User with this email already exists.."));

    const newUser = await User.create({
      email,
      password,
    });

    res.status(201).json({
      user: newUser,
    });
  })
);

router.put(
  "/login",
  catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    const validateResult = validateAuth(req.body);

    if (!validateResult.status) {
      return next(new AppError(400, validateResult.error));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) return next(new AppError(401, "Email or password is wrong"));

    const passwordIsValid = await user.checkPassword(password, user.password);
    if (!passwordIsValid)
      return next(new AppError(401, "Email or password is wrong"));

    const token = jwt.sign(user.id, process.env.JWT_SECRET);
    user.token = token;
    console.log(user);
    const updatedContact = await User.findByIdAndUpdate(user.id, user, {
      new: true,
    });
    user.password = undefined;

    res.status(200).json({
      user: updatedContact,
    });
  })
);

router.patch(
  "/logout",
  authMiddlewave.protect,
  catchAsync(async (req, res, next) => {
    const { email, subscription, token } = req.user;

    if (!token) return next(new AppError(401, "Not authorized"));

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { email, subscription, token: null },
      { new: true }
    );

    res.status(200).json({ user: updatedUser });
  })
);

router.get(
  "/current",
  authMiddlewave.protect,
  catchAsync(async (req, res, next) => {
    const { token } = req.user;

    if (!token) return next(new AppError(401, "Not authorized"));

    res.status(200).json({
      email: req.user.email,
      subscription: req.user.subscription,
    });
  })
);

router.patch(
  "/avatars",
  authMiddlewave.protect,
  uploadUserPhoto,
  catchAsync(async (req, res, next) => {
    const { user, file } = req;
    if (file) {
      user.avatarURL = await ImageService.save(file, 250, 250, "avatars");
    }

    Object.keys(req.body).forEach((key) => {
      user[key] = req.body[key];
    });
    const updatedUser = await user.save();

    res.status(200).json({
      user: updatedUser,
    });
  })
);
module.exports = router;
