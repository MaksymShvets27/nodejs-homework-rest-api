const express = require("express");

const router = express.Router();

const {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
} = require("../../models/contacts.js");
const { validate } = require("../../service/validation.js");

router.get("/", async (req, res, next) => {
  try {
    const contacts = await listContacts();
    res.status(200).json({
      contacts,
    });
  } catch (error) {
    res.sendStatus(500);
  }
});

router.get("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;

    const currentContact = await getContactById(contactId);
    if (!currentContact) {
      res.status(404).json({
        message: "Contact Not found",
      });
    }
    res.status(200).json({
      contact: currentContact,
    });
  } catch (error) {
    res.status(500);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const body = req.body;
    const validateResult = validate(body);

    const { name, email, phone } = body;
    if (!(name && email && phone)) {
      res.status(400).json({
        message: "missing required name field",
      });
    }

    if (!validateResult.status) {
      res.status(400).json({
        message: validateResult.error,
      });
      return;
    }
    const newContact = await addContact(body);
    res.status(201).json({
      contact: newContact,
    });
  } catch (error) {
    res.status(500);
  }
});

router.delete("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const contacts = await listContacts();
    const findContactById = contacts.find((item) => item.id === contactId);
    if (!findContactById) {
      res.status(404).json({
        message: "Contact For Delete Not found",
      });
    }
    await removeContact(contactId);
    res.status(200).json({
      message: "Contact Deleted",
    });
  } catch (error) {
    res.status(500);
  }
});

router.put("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const body = req.body;

    const contacts = await listContacts();

    const findContactById = contacts.find((item) => item.id === contactId);
    if (!findContactById) {
      res.status(404).json({
        message: "Contact For Update Not found",
      });
    }
    if (!body) {
      res.status(400).json({
        message: "missing field",
      });
    }

    const validateResult = validate(body);
    if (!validateResult.status) {
      res.status(400).json({
        message: validateResult.error,
      });
    } else {
      const updatedContact = await updateContact(contactId, body);

      res.status(200).json({ updatedContact });
    }
  } catch (error) {
    res.status(500);
  }
});

module.exports = router;
