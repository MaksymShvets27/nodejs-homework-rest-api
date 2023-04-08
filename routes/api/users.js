const express = require("express");
const jwt = require("jsonwebtoken");
// const nodemailer = require("nodemailer");

const router = express.Router();
const authMiddlewave = require("../../middlewares/authMiddlewave");
const { uploadUserPhoto } = require("../../middlewares/uploadUserPhoto");
const uuid = require("uuid").v4;
const User = require("../../models/usersModel");
const ImageService = require("../../service/imageService");
const {
  validateAuth,
  catchAsync,
  AppError,
} = require("../../service/index.js");
const Email = require("../../service/email/email");

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
      verificationToken: uuid(),
    });

    // const emailTransoprt = nodemailer.createTransport({
    //   host: process.env.EMAIL_HOST,
    //   port: process.env.EMAIL_PORT,
    //   auth: {
    //     user: process.env.EMAIL_USERNAME,
    //     pass: process.env.EMAIL_PASSWORD,
    //   },
    // });

    // const emailConfig = {
    //   from: "Contacts App Admin <admin@blablamail.com>",
    //   to: newUser.email,
    //   subject: "Hello new user",
    //   text: "Hi, glad to see you, in our platform",
    // };

    // await emailTransoprt.sendMail(emailConfig);
    await new Email(newUser, "/users/verify/:verificationToken").sendHello();

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

    if (!user.verify)
      return next(new AppError(401, "Email is not verificated"));

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

router.patch(
  "/verify/:verificationToken",
  catchAsync(async (req, res, next) => {
    const { verificationToken } = req.user;

    const user = await User.findOne({ verificationToken });

    if (!user) {
      return next(new AppError(401, "Not Found"));
    }

    const verificatedUser = await User.findByIdAndUpdate(
      user.id,
      { verificationToken: null, verify: true },
      { new: true }
    );
    res.status(200).json({ user: verificatedUser });
  })
);

router.post(
  "/verify",
  catchAsync(async (req, res, next) => {
    const { email } = req.body;

    if (!email) return next(new AppError(400, "Missing required field email"));

    const user = await User.findOne({ email });

    if (!user) {
      return next(new AppError(401, "Not Found"));
    }

    if (user.verify === true) return next(new AppError(400, "Bad Request"));

    await new Email(user, "/users/verify/:verificationToken").sendHello();

    res.status(200).json({ message: "Verification email sent", user });
  })
);

module.exports = router;
