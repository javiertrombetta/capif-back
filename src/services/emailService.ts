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

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Correo enviado con éxito:', info.messageId);
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    throw error;
  }
};
