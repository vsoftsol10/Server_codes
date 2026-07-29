import nodemailer from 'nodemailer';

let transporter = null;
let transporterKey = '';

const getSmtpConfig = () => ({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS,
  fromName: process.env.SMTP_FROM_NAME,
  fromEmail: process.env.SMTP_FROM_EMAIL,
});

const getTransporter = () => {
  const config = getSmtpConfig();
  if (!config.host || !config.port || !config.user || !config.pass || !config.fromName || !config.fromEmail) {
    const error = new Error('SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM_NAME, and SMTP_FROM_EMAIL are required to send email');
    error.code = 'SMTP_CONFIG_MISSING';
    throw error;
  }

  const nextKey = `${config.host}:${config.port}:${config.secure}:${config.user}`;
  if (!transporter || transporterKey !== nextKey) {
    transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
    transporterKey = nextKey;
  }

  return {
    transporter,
    from: `"${config.fromName}" <${config.fromEmail}>`,
  };
};

export async function sendEmail({ to, subject, html }) {
  try {
    const mailer = getTransporter();
    await mailer.transporter.sendMail({
      from: mailer.from,
      to,
      subject,
      html,
    });

    console.log(`[Email] Sent to ${to}`);
    return { success: true, to, subject };
  } catch (err) {
    console.error(`[Email] Failed to ${to}:`, err.message);
    return {
      success: false,
      to,
      subject,
      error: err.message,
      code: err.code,
    };
  }
}
