import nodemailer from 'nodemailer';

let transporter = null;
let transporterKey = '';

const getSmtpConfig = () => ({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT || 587),
  secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true',
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS,
});

const getTransporter = () => {
  const config = getSmtpConfig();
  if (!config.user || !config.pass) {
    const error = new Error('SMTP_USER and SMTP_PASS are required to send email');
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
    from: process.env.SMTP_FROM || `"Vconstech ERP" <${config.user}>`,
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
