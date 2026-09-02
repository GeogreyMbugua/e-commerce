import { Injectable, Logger } from '@nestjs/common';
import type {
  EmailSender,
  OrderConfirmationEmail,
} from '../application/ports/email.sender.js';

@Injectable()
export class LoggingEmailSender implements EmailSender {
  private readonly logger = new Logger(LoggingEmailSender.name);

  sendOrderConfirmation(input: OrderConfirmationEmail): Promise<void> {
    this.logger.log(
      `Order confirmation email queued for ${input.reference} -> ${input.to}`,
    );
    return Promise.resolve();
  }
}
