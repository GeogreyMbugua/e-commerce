import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../../shared/config/env.schema.js';
import { EMAIL_SENDER } from './application/ports/email.sender.js';
import { LoggingEmailSender } from './infrastructure/logging-email.sender.js';
import { NodemailerEmailSender } from './infrastructure/nodemailer-email.sender.js';
import { OutboxProcessor } from './infrastructure/outbox.processor.js';

@Module({
  providers: [
    OutboxProcessor,
    NodemailerEmailSender,
    LoggingEmailSender,
    {
      provide: EMAIL_SENDER,
      useFactory: (
        config: ConfigService<Env, true>,
        nodemailerSender: NodemailerEmailSender,
        loggingSender: LoggingEmailSender,
      ) => {
        const nodeEnv = config.get('NODE_ENV', { infer: true });
        const smtpHost = config.get('SMTP_HOST', { infer: true });

        if (nodeEnv === 'test' || !smtpHost) {
          return loggingSender;
        }

        return nodemailerSender;
      },
      inject: [ConfigService, NodemailerEmailSender, LoggingEmailSender],
    },
  ],
  exports: [OutboxProcessor],
})
export class NotificationsModule {}
