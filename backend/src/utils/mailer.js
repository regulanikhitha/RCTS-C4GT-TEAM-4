const tls = require('tls');
const net = require('net');

/**
 * Sends raw SMTP email via socket connection.
 */
const sendViaSmtpSocket = (options, smtpConfig) => {
  return new Promise((resolve, reject) => {
    const { host, port, user, pass, from } = smtpConfig;
    const isSecure = port === 465 || port === '465';
    
    let client;
    if (isSecure) {
      client = tls.connect({ host, port: Number(port), rejectUnauthorized: false });
    } else {
      client = net.connect({ host, port: Number(port) });
    }

    let step = 0;
    let response = '';

    client.setEncoding('utf8');

    client.on('data', (chunk) => {
      response += chunk;
      const lines = response.split('\r\n');
      const lastLine = lines[lines.length - 2] || lines[lines.length - 1];

      if (lastLine.startsWith('220') && step === 0) {
        step++;
        client.write(`EHLO localhost\r\n`);
      } else if (lastLine.startsWith('250') && step === 1) {
        step++;
        client.write(`AUTH LOGIN\r\n`);
      } else if (lastLine.startsWith('334') && step === 2) {
        step++;
        client.write(`${Buffer.from(user).toString('base64')}\r\n`);
      } else if (lastLine.startsWith('334') && step === 3) {
        step++;
        client.write(`${Buffer.from(pass).toString('base64')}\r\n`);
      } else if (lastLine.startsWith('235') && step === 4) {
        step++;
        client.write(`MAIL FROM:<${from || user}>\r\n`);
      } else if (lastLine.startsWith('250') && step === 5) {
        step++;
        client.write(`RCPT TO:<${options.to}>\r\n`);
      } else if (lastLine.startsWith('250') && step === 6) {
        step++;
        client.write(`DATA\r\n`);
      } else if (lastLine.startsWith('354') && step === 7) {
        step++;
        const boundary = `----=_Part_${Date.now()}`;
        const message = [
          `From: ${from || user}`,
          `To: ${options.to}`,
          `Subject: ${options.subject}`,
          `MIME-Version: 1.0`,
          `Content-Type: multipart/alternative; boundary="${boundary}"`,
          ``,
          `--${boundary}`,
          `Content-Type: text/plain; charset=utf-8`,
          ``,
          options.text || '',
          ``,
          `--${boundary}`,
          `Content-Type: text/html; charset=utf-8`,
          ``,
          options.html || '',
          ``,
          `--${boundary}--`,
          `.`,
          ``,
        ].join('\r\n');
        client.write(message);
      } else if (lastLine.startsWith('250') && step === 8) {
        step++;
        client.write(`QUIT\r\n`);
        resolve(true);
      }
    });

    client.on('error', (err) => {
      reject(err);
    });

    client.setTimeout(10000, () => {
      client.destroy();
      reject(new Error('SMTP connection timed out'));
    });
  });
};

/**
 * Dispatches an email using configured SMTP credentials or fallback console output.
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || 'no-reply@c4gt-attendance.org';

  if (smtpHost && smtpUser && smtpPass) {
    try {
      await sendViaSmtpSocket(
        { to, subject, html, text },
        { host: smtpHost, port: smtpPort, user: smtpUser, pass: smtpPass, from: smtpFrom }
      );
      console.log(`✉️ [EMAIL DISPATCHED] To: ${to} | Subject: ${subject}`);
      return { success: true, mode: 'smtp' };
    } catch (err) {
      console.error(`⚠️ [SMTP ERROR] Failed to send email via SMTP: ${err.message}. Falling back to console logger.`);
    }
  }

  // Fallback / Development Console Logger
  console.log('\n======================================================');
  console.log('📧 [EMAIL NOTIFICATION PREVIEW (DEV / TESTING MODE)]');
  console.log(`To:      ${to}`);
  console.log(`Subject: ${subject}`);
  console.log('------------------------------------------------------');
  console.log(text || html);
  console.log('======================================================\n');

  return { success: true, mode: 'console' };
};

/**
 * 1. Send Login Notification Email
 */
const sendLoginNotificationEmail = async ({ email, name, loginTime, ipAddress, userAgent }) => {
  const formattedTime = loginTime
    ? new Date(loginTime).toLocaleString('en-US', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'medium' }) + ' (IST)'
    : new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'medium' }) + ' (IST)';

  const subject = '🔐 C4GT Hub Attendance — Student Login Notification';

  const text = `Hello ${name},\n\nThis is an automated notification to confirm that your account was successfully logged in to the C4GT Hub Attendance Portal.\n\nLogin Details:\n- Account: ${email}\n- Date & Time: ${formattedTime}\n- Status: Successful Login\n- IP Address: ${ipAddress || 'Not specified'}\n\nSecurity Notice:\nIf you did not perform this login, please immediately reset your password and notify your program coordinator.\n\nBest regards,\nC4GT Hub Attendance Security Team`;

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; padding: 30px 15px; color: #1e293b;">
      <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
        <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 24px; text-align: center; color: #ffffff;">
          <h2 style="margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">C4GT Hub Attendance</h2>
          <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">Security Alert: Successful Login</p>
        </div>
        <div style="padding: 28px 24px;">
          <p style="font-size: 16px; margin: 0 0 16px;">Hello <strong>${name}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px;">
            This is a security notification confirming that a successful login occurred on your C4GT Hub Attendance account.
          </p>
          
          <div style="background-color: #f1f5f9; border-left: 4px solid #2563eb; padding: 16px; border-radius: 6px; margin-bottom: 24px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 4px 0; color: #64748b; width: 120px;"><strong>Account:</strong></td>
                <td style="padding: 4px 0; color: #0f172a;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #64748b;"><strong>Date & Time:</strong></td>
                <td style="padding: 4px 0; color: #0f172a;">${formattedTime}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #64748b;"><strong>Login Status:</strong></td>
                <td style="padding: 4px 0; color: #16a34a; font-weight: 600;">✅ Successful Login</td>
              </tr>
              ${ipAddress ? `
              <tr>
                <td style="padding: 4px 0; color: #64748b;"><strong>IP Address:</strong></td>
                <td style="padding: 4px 0; color: #0f172a;">${ipAddress}</td>
              </tr>` : ''}
            </table>
          </div>

          <div style="background-color: #fffbeb; border: 1px solid #fef3c7; padding: 14px; border-radius: 6px; font-size: 13px; color: #92400e; line-height: 1.5;">
            <strong>⚠️ Security Notice:</strong> If you did not initiate this login, someone else may have gained access to your account. Please reset your password immediately.
          </div>
        </div>
        <div style="background-color: #f8fafc; padding: 16px 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
          © ${new Date().getFullYear()} C4GT Hub Attendance Management System. All rights reserved.
        </div>
      </div>
    </div>
  `;

  return sendEmail({ to: email, subject, html, text });
};

/**
 * 2. Send Forgot Password OTP Email
 */
const sendOtpEmail = async ({ email, name, otp, expiresInMinutes = 10 }) => {
  const subject = '🔑 C4GT Hub Attendance — Password Reset Verification OTP';

  const text = `Hello ${name},\n\nYou recently requested to reset your password for your C4GT Hub Attendance account.\n\nYour One-Time Password (OTP) is: ${otp}\n\nThis OTP is valid for ${expiresInMinutes} minutes and will expire automatically. You have a maximum of 5 verification attempts.\n\nSecurity Notice:\nNever share your OTP with anyone. C4GT administrators will never ask for your password or OTP.\n\nIf you did not request a password reset, please ignore this email.\n\nBest regards,\nC4GT Hub Attendance Team`;

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; padding: 30px 15px; color: #1e293b;">
      <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
        <div style="background: linear-gradient(135deg, #4f46e5, #4338ca); padding: 24px; text-align: center; color: #ffffff;">
          <h2 style="margin: 0; font-size: 22px; font-weight: 700;">C4GT Hub Attendance</h2>
          <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">Password Recovery Verification</p>
        </div>
        <div style="padding: 28px 24px; text-align: center;">
          <p style="font-size: 16px; margin: 0 0 12px; text-align: left;">Hello <strong>${name}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px; text-align: left;">
            We received a request to reset the password for your C4GT Hub Attendance account. Use the one-time verification code below to proceed:
          </p>
          
          <div style="background: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 10px; padding: 20px; margin: 20px 0; display: inline-block;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #312e81; font-family: monospace;">${otp}</span>
          </div>

          <p style="font-size: 13px; color: #64748b; margin: 8px 0 20px;">
            ⏳ This OTP is valid for <strong>${expiresInMinutes} minutes</strong> and allows up to 5 attempts.
          </p>

          <div style="background-color: #fef2f2; border: 1px solid #fee2e2; padding: 14px; border-radius: 6px; font-size: 13px; color: #991b1b; text-align: left; line-height: 1.5;">
            <strong>🛡️ Security Warning:</strong> Do not share this OTP with anyone under any circumstances. If you did not request this password reset, please ignore this email.
          </div>
        </div>
        <div style="background-color: #f8fafc; padding: 16px 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
          © ${new Date().getFullYear()} C4GT Hub Attendance Management System.
        </div>
      </div>
    </div>
  `;

  return sendEmail({ to: email, subject, html, text });
};

/**
 * 3. Send Password Reset Confirmation Email
 */
const sendPasswordResetConfirmationEmail = async ({ email, name, resetTime }) => {
  const formattedTime = resetTime
    ? new Date(resetTime).toLocaleString('en-US', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'medium' }) + ' (IST)'
    : new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'medium' }) + ' (IST)';

  const subject = '✅ C4GT Hub Attendance — Password Reset Successful';

  const text = `Hello ${name},\n\nYour password for C4GT Hub Attendance was successfully updated on ${formattedTime}.\n\nIf you performed this change, no further action is needed.\n\nIf you did not perform this change, please contact your system administrator immediately.\n\nBest regards,\nC4GT Hub Attendance Security Team`;

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; padding: 30px 15px; color: #1e293b;">
      <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
        <div style="background: linear-gradient(135deg, #059669, #047857); padding: 24px; text-align: center; color: #ffffff;">
          <h2 style="margin: 0; font-size: 22px; font-weight: 700;">C4GT Hub Attendance</h2>
          <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">Password Changed Successfully</p>
        </div>
        <div style="padding: 28px 24px;">
          <p style="font-size: 16px; margin: 0 0 16px;">Hello <strong>${name}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px;">
            This email confirms that the password for your C4GT Hub Attendance account (<strong>${email}</strong>) has been successfully updated on <strong>${formattedTime}</strong>.
          </p>
          
          <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 14px; border-radius: 6px; font-size: 14px; color: #166534; margin-bottom: 20px;">
            ✅ You can now log in to the portal using your new password.
          </div>

          <div style="background-color: #fff7ed; border: 1px solid #ffedd5; padding: 14px; border-radius: 6px; font-size: 13px; color: #9a3412; line-height: 1.5;">
            <strong>⚠️ Did not request this change?</strong> If you did not update your password, your account may have been compromised. Contact your coordinator immediately.
          </div>
        </div>
        <div style="background-color: #f8fafc; padding: 16px 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
          © ${new Date().getFullYear()} C4GT Hub Attendance Management System.
        </div>
      </div>
    </div>
  `;

  return sendEmail({ to: email, subject, html, text });
};

module.exports = {
  sendEmail,
  sendLoginNotificationEmail,
  sendOtpEmail,
  sendPasswordResetConfirmationEmail,
};
