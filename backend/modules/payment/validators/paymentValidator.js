import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const paymentValidator = {
  createOrderSchema: z.object({
    propertyId: z.string().refine(val => objectIdRegex.test(val), {
      message: 'Invalid Property ID format. Must be a valid MongoDB ObjectId.'
    }),
    amount: z.number().positive({
      message: 'Payment amount must be a positive number greater than 0.'
    }),
    paymentType: z.enum(['booking_deposit', 'reservation_fee', 'application_fee', 'service_fee', 'security_deposit', 'rent'], {
      errorMap: () => ({ message: 'Invalid payment type selection.' })
    })
  }),

  verifyPaymentSchema: z.object({
    orderId: z.string().min(1, { message: 'Order ID is required.' }),
    paymentId: z.string().min(1, { message: 'Payment ID is required.' }),
    signature: z.string().min(1, { message: 'Gateway verification signature is required.' })
  }),

  validateBody: (schema) => {
    return (req, res, next) => {
      try {
        schema.parse(req.body);
        next();
      } catch (err) {
        return res.status(400).json({
          success: false,
          error: err.errors?.[0]?.message || 'Validation failed.'
        });
      }
    };
  }
};

export default paymentValidator;
