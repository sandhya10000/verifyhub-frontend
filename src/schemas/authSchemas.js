import { z } from 'zod';
import { INDIAN_STATES } from '../data/indianStates';

export const loginSchema = z.object({
  email: z.string().min(1, { message: 'Email or Partner ID is required' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  rememberMe: z.boolean().optional(),
});

export const signupSchema = z.object({
  firstName: z.string().min(2, { message: 'First name is required' }),
  lastName: z.string().min(2, { message: 'Last name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  phone: z.string().regex(/^\d{10}$/, { message: 'Phone number must be 10 digits' }),
  state: z.enum(INDIAN_STATES, { message: 'Please select a valid state' }),
  city: z.string().min(2, { message: 'City is required' }),
  pincode: z.string().regex(/^\d{6}$/, { message: 'Pincode must be 6 digits' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  confirmPassword: z.string(),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the Terms & Conditions' }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
});

export const otpSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, { message: 'Enter the 6-digit OTP' }),
});

export const resetPasswordSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, { message: 'Enter the 6-digit OTP' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});
