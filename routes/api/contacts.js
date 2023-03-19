const express = require("express");

const Contact = require("../../models/contactsModel.js");
const { validate, catchAsync, AppError } = require("../../service/index.js");
const protectMiddlewave = require("../../middlewares/authMiddlewave");

const router = express.Router();

router.use(protectMiddlewave.protect);

router.get(
  "/",
  catchAsync(async (req, res, next) => {
    const contacts = await Contact.find();
    res.status(200).json({
      contacts,
    });
  })
);

router.get(
  "/:contactId",
  catchAsync(async (req, res, next) => {
    const { contactId } = req.params;

    const currentContact = await Contact.findById(contactId);

    res.status(200).json({
      contact: currentContact,
    });
  })
);

router.post(
  "/",
  catchAsync(async (req, res, next) => {
    const { name, email, phone, favorite } = req.body;

    const validateResult = validate(req.body);

    if (!validateResult.status) {
      return next(new AppError(400, validateResult.error));
    }

    const newContact = await Contact.create({
      name,
      email,
      phone,
      favorite,
    });
    res.status(201).json({
      contact: newContact,
    });
  })
);

router.delete(
  "/:contactId",
  catchAsync(async (req, res, next) => {
    const { contactId } = req.params;
    await Contact.findByIdAndRemove(contactId);
    res.status(200).json({
      message: "Contact Deleted",
    });
  })
);

router.put(
  "/:contactId",
  catchAsync(async (req, res, next) => {
    const { contactId } = req.params;
    const { name, email, phone, favorite } = req.body;

    const validateResult = validate(req.body);

    if (!validateResult.status) {
      return next(new AppError(400, validateResult.error));
    }

    const updatedContact = await Contact.findByIdAndUpdate(
      contactId,
      { name, email, phone, favorite },
      { new: true }
    );
    res.status(200).json({ contact: updatedContact });
  })
);

router.patch(
  "/:contactId/favorite",
  catchAsync(async (req, res, next) => {
    if (!req.body.favorite) {
      return next(new AppError(400, "Missing field favorite"));
    }

    const { name, email, phone } = req.body;
    const updatedContact = {
      name,
      email,
      phone,
      favorite: true,
    };
    res.status(200).json({ contact: updatedContact });
  })
);
module.exports = router;
