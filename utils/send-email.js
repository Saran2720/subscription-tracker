import transporter, { accountEmail } from "../config/nodemailer.js";
import { emailTemplates } from "./email-template.js";
import dayjs from 'dayjs';

export const sendReminderEmail = async ({ to, type, subscription }) => {
  if (!to || !type) throw new Error("Missing required Parameter");

  const template = emailTemplates.find((t) => t.type === type);

  if (!template) throw new Error("Invalid email type");

  const mailInfo = {
    userName: subscription.userName,
    subscriptionName: subscription.subscriptionName,
    renewalDate: dayjs(subscription.renewalDate).format("MMM DD YYYY"),
    planName: subscription.planName,
    price: `${subscription.currency} ${subscription.price} ${subscription.frequency}`,
    payementMethod: subscription.payementMethod,
  };

  const message = template.generateBody(mailInfo);
  const subject = template.generateSubject(mailInfo);

  const mailOptions = {
    from: accountEmail,
    to: to,
    subject: subject,
    html: message,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) return console.log(error, "Error sending email");

    console.log("Email sended " + info.response);
  });
};
