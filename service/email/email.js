const nodemailer = require("nodemailer");
const pug = require("pug");
const path = require("path");
const { convert } = require("html-to-text");

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.url = url;
    this.from = `Contacts Admin <${process.env.SENDGRID_FROM}>`;
  }

  _initTransport() {
    if (process.env.NODE_ENV === "production") {
      return nodemailer.createTransport({
        service: "SendGrid",
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_API_KEY,
        },
      });
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async _send(template, subject) {
    const html = pug.renderFile(
      path.join(__dirname, "..", "..", "view", "emails", `${template}.pug`),
      {
        url: this.url,
        subject,
      }
    );
    const emailConfig = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html),
    };
    await this._initTransport().sendMail(emailConfig);
  }

  async sendHello() {
    await this._send("greeting", "Welcom to our super servise.");
  }

  async sendPasswordReset() {
    await this._send("password", "Password reset");
  }
};
