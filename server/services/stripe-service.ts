import Stripe from 'stripe';
import { z } from 'zod';
import { Flight, Booking } from '@shared/schema';

// Initialize Stripe with your API key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

export const paymentIntentSchema = z.object({
  bookingId: z.number(),
  amount: z.number().positive(),
  currency: z.string().default('EUR'),
  paymentMethodId: z.string().optional(),
  description: z.string().optional(),
  receiptEmail: z.string().email().optional(),
});

export type PaymentIntentData = z.infer<typeof paymentIntentSchema>;

export class StripeService {
  /**
   * Create a PaymentIntent for a booking
   */
  async createPaymentIntent(data: PaymentIntentData) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(data.amount * 100), // Convert to cents
        currency: data.currency.toLowerCase(),
        ...(data.paymentMethodId && { payment_method: data.paymentMethodId }),
        ...(data.description && { description: data.description }),
        ...(data.receiptEmail && { receipt_email: data.receiptEmail }),
        metadata: {
          bookingId: data.bookingId.toString(),
        },
        confirmation_method: 'manual',
        capture_method: 'automatic'
      });
      
      return {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        status: paymentIntent.status,
        currency: paymentIntent.currency,
        amount: paymentIntent.amount / 100, // Convert from cents
      };
    } catch (error: any) {
      console.error('Error creating payment intent:', error.message);
      throw new Error(`Error creating payment intent: ${error.message}`);
    }
  }

  /**
   * Confirm a PaymentIntent after getting card details from the client
   */
  async confirmPaymentIntent(paymentIntentId: string, paymentMethodId: string) {
    try {
      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId,
      });
      
      return {
        id: paymentIntent.id,
        status: paymentIntent.status,
        clientSecret: paymentIntent.client_secret,
      };
    } catch (error: any) {
      console.error('Error confirming payment intent:', error.message);
      throw new Error(`Error confirming payment intent: ${error.message}`);
    }
  }

  /**
   * Get payment intent details
   */
  async getPaymentIntent(paymentIntentId: string) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        clientSecret: paymentIntent.client_secret,
        bookingId: paymentIntent.metadata?.bookingId,
      };
    } catch (error: any) {
      console.error('Error retrieving payment intent:', error.message);
      throw new Error(`Error retrieving payment intent: ${error.message}`);
    }
  }

  /**
   * Create pricing description for Stripe invoice
   */
  generatePaymentDescription(flight: Flight, booking: Booking, passengers: number): string {
    const additionalServices = [];
    if (booking.expressProcessing) additionalServices.push('Express Processing');
    if (booking.editableTicket) additionalServices.push('Editable Ticket');
    if (booking.hotelReservation) additionalServices.push('Hotel Reservation');
    if (booking.insuranceLetter) additionalServices.push('Insurance Letter');
    
    const baseDescription = `Flight ${flight.airlineCode}${flight.flightNumber}: ${flight.departureAirport} to ${flight.arrivalAirport}`;
    const passengersStr = `${passengers} passenger${passengers > 1 ? 's' : ''}`;
    
    if (additionalServices.length > 0) {
      return `${baseDescription} - ${passengersStr} with ${additionalServices.join(', ')}`;
    }
    
    return `${baseDescription} - ${passengersStr}`;
  }
}

// Create a singleton instance
export const stripeService = new StripeService();