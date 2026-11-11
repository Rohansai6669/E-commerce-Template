import { EmailProvider, SendEmailOptions } from '../types';
import { emailConfig } from '../../config/email';
import { logger } from '../../logger';

export class MockEmailProvider implements EmailProvider {
  async send(options: SendEmailOptions) {
    logger.info(`[MOCK EMAIL] To: ${options.to}, Subject: ${options.subject}`);
    return { success: true, messageId: 'mock-id-' + Math.random().toString(36).substring(2, 11) };
  }
}

export class SMTPEmailProvider implements EmailProvider {
  async send(options: SendEmailOptions) {
    logger.info(`[SMTP EMAIL] Sending to ${options.to} via host ${emailConfig.smtp.host}`);
    return { success: true, messageId: 'smtp-id-' + Date.now() };
  }
}

export class ResendEmailProvider implements EmailProvider {
  async send(options: SendEmailOptions) {
    logger.info(`[RESEND EMAIL] Sending to ${options.to}`);
    return { success: true, messageId: 'resend-id-' + Date.now() };
  }
}
