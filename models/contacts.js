const fs = require("fs").promises;
const uuid = require("uuid").v4;

let contactsList = [];

const takeContacts = async () => {
  try {
    const data = await fs.readFile("./models/contacts.json");
    const json = JSON.parse(data.toString());

    return json;
  } catch (error) {
    console.log("error takeContacts");
  }
};

const listContacts = async () => {
  try {
    contactsList = await takeContacts();

    return contactsList;
  } catch (error) {
    console.log(error.messege);
  }
};

const getContactById = async (contactId) => {
  try {
    contactsList = await takeContacts();

    const currentContact = contactsList.find(
      (contact) => contact.id === contactId
    );

    return currentContact;
  } catch (error) {
    console.log(error.messege);
  }
};

const removeContact = async (contactId) => {
  try {
    contactsList = await takeContacts();

    const newContactsList = contactsList.filter(
      (contact) => contact.id !== contactId
    );

    await fs.writeFile(
      "./models/contacts.json",
      JSON.stringify(newContactsList)
    );
  } catch (error) {
    console.log("error.messege");
  }
};

const addContact = async (body) => {
  try {
    const { name, email, phone } = body;
    contactsList = await takeContacts();

    const newUser = {
      id: uuid().toString(),
      name,
      email,
      phone,
    };

    contactsList.push(newUser);

    await fs.writeFile("./models/contacts.json", JSON.stringify(contactsList));
    return newUser;
  } catch (error) {
    console.log("error addContact");
  }
};

const updateContact = async (contactId, body) => {
  try {
    contactsList = await takeContacts();
    const { name, email, phone } = body;
    const currentContact = contactsList.find(
      (contact) => contact.id === contactId
    );

    if (name) currentContact.name = name;
    if (email) currentContact.email = email;
    if (phone) currentContact.phone = phone;

    const contactIndex = contactsList.findIndex(
      (item) => item.id === contactId
    );

    contactsList[contactIndex] = currentContact;

    await fs.writeFile("./models/contacts.json", JSON.stringify(contactsList));

    return currentContact;
  } catch (error) {
    console.log("error updateContact");
  }
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
