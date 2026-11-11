export function getWelcomeEmailHtml(name: string, appUrl: string): string {
  return `
    <div style="font-family: sans-serif; padding: 20px;">
      <h1>Welcome, ${name}!</h1>
      <p>Thanks for joining our platform. We are excited to have you on board.</p>
      <a href="${appUrl}" style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
    </div>
  `;
}

export function getResetPasswordEmailHtml(resetLink: string): string {
  return `
    <div style="font-family: sans-serif; padding: 20px;">
      <h1>Reset Your Password</h1>
      <p>We received a request to reset your account password. Click the button below to set a new password:</p>
      <a href="${resetLink}" style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>If you did not request this reset, you can safely ignore this email.</p>
    </div>
  `;
}
