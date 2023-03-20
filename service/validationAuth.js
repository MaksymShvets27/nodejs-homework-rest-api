const Joi = require("joi");

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,128})/;

const schema = Joi.object({
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net", "ua"] },
    })
    .required(),
  password: Joi.string().regex(PASSWORD_REGEX).required(),
});

const validateAuth = ({ email, password }) => {
  const validateResult = schema.validate({
    email: email,
    password: password,
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

module.exports = { validateAuth };
