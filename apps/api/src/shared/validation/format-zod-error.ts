import { ZodError } from 'zod';

export type ValidationFieldError = {
  name: string;
  code: string;
  message: string;
};

export const formatZodError = (error: ZodError): ValidationFieldError[] =>
  error.issues.map((issue) => ({
    name: issue.path.join('.') || 'root',
    code: issue.code,
    message: issue.message,
  }));
