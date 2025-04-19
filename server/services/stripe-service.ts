import Stripe from "stripe";
import { z } from "zod";
import { Flight, Booking } from "@shared/schema";

// Initialize Stripe with API key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16",
});

// Schema for payment intent data
export const paymentIntentSchema = z.object({
  bookingId: z.number(),
  amount: z.number().positive(),
  currency: z.string().default("EUR"),
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
      // Convert amount to cents (Stripe requires amounts in smallest currency unit)
      const amountInCents = Math.round(data.amount * 100);
      
      // Create payment intent using Stripe API
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: data.currency.toLowerCase(),
        description: data.description,
        receipt_email: data.receiptEmail,
        metadata: {
          bookingId: data.bookingId.toString(),
          application: "Global Air Travel Services"
        }
      });
      
      return {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: data.amount,
        currency: data.currency,
        status: paymentIntent.status
      };
    } catch (error: any) {
      console.error("Stripe payment intent creation failed:", error.message);
      throw new Error(`Payment processing failed: ${error.message}`);
    }
  }

  /**
   * Confirm a PaymentIntent after getting card details from the client
   */
  async confirmPaymentIntent(paymentIntentId: string, paymentMethodId: string) {
    try {
      const paymentIntent = await stripe.paymentIntents.confirm(
        paymentIntentId,
        {
          payment_method: paymentMethodId,
        }
      );
      
      return {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100, // Convert from cents back to currency units
        currency: paymentIntent.currency
      };
    } catch (error: any) {
      console.error("Stripe payment confirmation failed:", error.message);
      throw new Error(`Payment confirmation failed: ${error.message}`);
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
        amount: paymentIntent.amount / 100, // Convert from cents to currency units
        currency: paymentIntent.currency
      };
    } catch (error: any) {
      console.error("Failed to retrieve payment intent:", error.message);
      throw new Error(`Payment retrieval failed: ${error.message}`);
    }
  }

  /**
   * Create pricing description for Stripe invoice
   */
  generatePaymentDescription(flight: Flight, booking: Booking, passengers: number): string {
    const airlineName = flight.airlineName || flight.airlineCode;
    const flightNumber = flight.flightNumber;
    const origin = flight.departureAirport;
    const destination = flight.arrivalAirport;
    const formattedDate = new Date(flight.departureTime).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    return `Booking ${booking.bookingReference} - ${airlineName} ${flightNumber} from ${origin} to ${destination} on ${formattedDate} for ${passengers} passenger(s)`;
  }
}

export const stripeService = new StripeService();