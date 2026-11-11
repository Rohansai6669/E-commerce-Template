import { emailClient } from './client';
import { emailConfig } from '../config/email';
import { getWelcomeEmailHtml, getResetPasswordEmailHtml } from './templates';

export class EmailService {
  public static async sendWelcomeEmail(to: string, name: string, appUrl: string) {
    const html = getWelcomeEmailHtml(name, appUrl);
    return emailClient.send({
      to,
      subject: `Welcome to ${emailConfig.systemName}!`,
      html,
      from: emailConfig.defaultFrom,
    });
  }

  public static async sendResetPasswordEmail(to: string, resetLink: string) {
    const html = getResetPasswordEmailHtml(resetLink);
    return emailClient.send({
      to,
      subject: `Reset your password - ${emailConfig.systemName}`,
      html,
      from: emailConfig.defaultFrom,
    });
  }
}
