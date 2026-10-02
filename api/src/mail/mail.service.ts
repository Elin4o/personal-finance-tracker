import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend;
  private readonly from: string;
  private readonly appUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.resend = new Resend(
      this.configService.getOrThrow<string>('RESEND_API_KEY'),
    );
    this.from = this.configService.getOrThrow<string>('MAIL_FROM');
    this.appUrl = this.configService.getOrThrow<string>('APP_URL');
  }

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const link = `${this.appUrl}/verify-email?token=${token}`;

    try {
      await this.resend.emails.send({
        from: this.from,
        to,
        subject: 'Verify your Fiscora email',
        html: `
          <p>Welcome to Fiscora — confirm your email to get started.</p>
          <p><a href="${link}">Verify my email</a></p>
          <p>This link expires in 24 hours.</p>
        `,
      });
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${to}`, error);
    }
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const link = `${this.appUrl}/reset-password?token=${token}`;

    try {
      await this.resend.emails.send({
        from: this.from,
        to,
        subject: 'Reset your Fiscora password',
        html: `
          <p>We received a request to reset your password.</p>
          <p><a href="${link}">Reset my password</a></p>
          <p>If you didn't request this, you can safely ignore this email. This link expires in 1 hour.</p>
        `,
      });
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${to}`, error);
    }
  }
}
