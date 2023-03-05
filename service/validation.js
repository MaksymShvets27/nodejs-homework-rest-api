const Joi = require("joi");

const schema = Joi.object({
  name: Joi.string().alphanum().min(3).max(30).required(),

  phone: Joi.number().integer(),

  email: Joi.string().email({
    minDomainSegments: 2,
    tlds: { allow: ["com", "net", "ua"] },
  }),
});

const validate = ({ name, email, phone }) => {
  const validateResult = schema.validate({
    name: name,
    email: email,
    phone: phone,
  });

  if (validateResult.error) {
    return {
      status: false,
      error: validateResult.error.message,
    };
  }
  return {
    status: true,
    value: validateResult.value,
  };
};

module.exports = { validate };
