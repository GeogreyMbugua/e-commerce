import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import type { Env } from '../../../shared/config/env.schema.js';
import type {
  EmailSender,
  OrderConfirmationEmail,
} from '../application/ports/email.sender.js';

@Injectable()
export class NodemailerEmailSender implements EmailSender {
  private readonly transporter: nodemailer.Transporter;
  private readonly fromAddress: string;
  private readonly enabled: boolean;

  constructor(private readonly config: ConfigService<Env, true>) {
    const host = this.config.get('SMTP_HOST', { infer: true });
    const port = this.config.get('SMTP_PORT', { infer: true }) ?? 1025;
    const user = this.config.get('SMTP_USER', { infer: true });
    const pass = this.config.get('SMTP_PASS', { infer: true });

    this.fromAddress =
      this.config.get('SMTP_FROM', { infer: true }) ??
      'AudioVintage <orders@audiovintage.local>';
    this.enabled = Boolean(host);

    this.transporter = nodemailer.createTransport({
      host: host ?? 'localhost',
      port,
      secure: port === 465,
      auth: user ? { user, pass: pass ?? '' } : undefined,
    });
  }

  async sendOrderConfirmation(input: OrderConfirmationEmail): Promise<void> {
    if (!this.enabled) {
      return;
    }

    const lineItems = input.lines
      .map(
        (line) =>
          `<li>${line.title} × ${line.quantity} — ${line.lineTotalLabel}</li>`,
      )
      .join('');

    const html = `
      <h1>Thank you for your AudioVintage order</h1>
      <p>Your order <strong>${input.reference}</strong> is confirmed.</p>
      <p>Total: <strong>${input.totalLabel}</strong></p>
      <ul>${lineItems}</ul>
      <p><a href="${input.orderUrl}">View your order status</a></p>
      <p>If the button does not work, copy this link into your browser:</p>
      <p>${input.orderUrl}</p>
    `.trim();

    await this.transporter.sendMail({
      from: this.fromAddress,
      to: input.to,
      subject: `AudioVintage order confirmed — ${input.reference}`,
      html,
      text: [
        `Thank you for your AudioVintage order.`,
        `Order ${input.reference} is confirmed.`,
        `Total: ${input.totalLabel}`,
        `View your order: ${input.orderUrl}`,
      ].join('\n'),
    });
  }
}
