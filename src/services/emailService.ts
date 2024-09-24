

import transporter from '../config/nodemailer';

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: MailOptions): Promise<void> => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};
