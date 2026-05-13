import { z } from 'zod';

export const SignUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Enter a valid email address.'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .regex(/[0-9]/, 'Password must include a number.')
    .regex(/[^a-zA-Z0-9]/, 'Password must include a symbol.'),
});

export const ConfirmSchema = z.object({
  code: z
    .string()
    .length(6, 'Code must be exactly 6 digits.')
    .regex(/^\d+$/, 'Code must contain only numbers.'),
});
