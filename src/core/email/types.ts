export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export interface EmailProvider {
  send(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: Error }>;
}
