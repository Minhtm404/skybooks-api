const htmlToText = require('html-to-text');
const nodemailer = require('nodemailer');
const path = require('path');
const pug = require('pug');

module.exports = class Email {
  constructor(user, url) {
    (this.to = user.email), (this.name = user.name);
    (this.url = url), (this.from = `Skybooks Team ${process.env.EMAIL_FROM}`);
  }

  createTransport() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async send(template, subject) {
    const html = pug.renderFile(path.join(__dirname, `../views/email/${template}.pug`), {
      name: this.name,
      url: this.url,
      subject
    });

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html)
    };

    await this.createTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to Skybooks!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes).'
    );
  }
};
