import { EmailProvider } from './types';
import { emailConfig } from '../config/email';
import { MockEmailProvider, SMTPEmailProvider, ResendEmailProvider } from './providers';
import { appConfig } from '../config/app';

let activeProvider: EmailProvider;

if (appConfig.isTest || (!emailConfig.resend.apiKey && !emailConfig.smtp.host)) {
  activeProvider = new MockEmailProvider();
} else if (emailConfig.resend.apiKey) {
  activeProvider = new ResendEmailProvider();
} else {
  activeProvider = new SMTPEmailProvider();
}

export const emailClient = activeProvider;
