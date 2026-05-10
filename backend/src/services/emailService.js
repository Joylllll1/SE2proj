import nodemailer from 'nodemailer';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_USER || !SMTP_PASS) {
    console.warn('[email] SMTP not configured — verification emails disabled');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST || 'smtp.qq.com',
    port: parseInt(SMTP_PORT, 10) || 465,
    secure: true,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  return transporter;
}

export async function sendVerificationCode(email, code) {
  const t = getTransporter();
  if (!t) {
    // Development fallback: log the code
    console.log(`[DEV] Verification code for ${email}: ${code}`);
    return;
  }

  await t.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: 'NJU树洞 — 邮箱验证码',
    text: `您的验证码是：${code}\n\n验证码 5 分钟内有效，请勿泄露给他人。\n\n如非本人操作，请忽略此邮件。`,
  });
}
