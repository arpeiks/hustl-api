export interface IEmail {
  email: string;
  text?: string;
  html?: string;
  subject?: string;
}

export interface IVerifyEmail {
  code: string;
  email: string;
  expiry: string;
}

export interface IResetPassword {
  code: string;
  email: string;
  expiry: string;
}

export const VerifyEmailTemplate = (data: IVerifyEmail) => {
  const subject = 'Verify your email - Hustl';
  const text = `VERIFY YOUR EMAIL ADDRESS\n\nThanks for creating your Hustl account. Enter the verification code below to continue.\n\nVerification code: ${data.code}\n\n(This code is valid for ${data.expiry})\n\n— The Hustl Team`;
  const html = `
  <div style="font-family:Inter,Arial,sans-serif;line-height:1.5;color:#111">
    <h2 style="margin:0 0 12px">Verify your email</h2>
    <p style="margin:0 0 16px">Thanks for creating your Hustl account. Enter the verification code below to continue.</p>
    <div style="font-size:24px;font-weight:700;letter-spacing:4px;margin:16px 0">${data.code}</div>
    <p style="margin:0 0 24px;color:#555">This code is valid for ${data.expiry}.</p>
    <p style="margin:24px 0 0;color:#666">— The Hustl Team</p>
  </div>`;
  return { subject, text, html };
};

export const ResetPasswordTemplate = (data: IResetPassword) => {
  const subject = 'Reset your password - Hustl';
  const text = `RESET YOUR PASSWORD\n\nWe received a request to reset your Hustl password. Use the code below to continue.\n\nVerification code: ${data.code}\n\n(This code is valid for ${data.expiry})\n\nIf you didn’t request this, you can safely ignore this email.`;
  const html = `
  <div style="font-family:Inter,Arial,sans-serif;line-height:1.5;color:#111">
    <h2 style="margin:0 0 12px">Reset your password</h2>
    <p style="margin:0 0 16px">We received a request to reset your Hustl password. Use the code below to continue.</p>
    <div style="font-size:24px;font-weight:700;letter-spacing:4px;margin:16px 0">${data.code}</div>
    <p style="margin:0 0 24px;color:#555">This code is valid for ${data.expiry}.</p>
    <p style="margin:24px 0 0;color:#666">If you didn’t request this, you can safely ignore this email.</p>
  </div>`;
  return { subject, text, html };
};
