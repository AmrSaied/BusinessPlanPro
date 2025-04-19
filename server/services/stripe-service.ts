import Stripe from 'stripe';
import { LogLevel } from '@shared/schema';
import { storage } from '../storage';

// Initialize Stripe with the API key
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required environment variable: STRIPE_SECRET_KEY');
}

// For Stripe API version, using the most recent supported version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16' as any, // Cast to any to bypass TypeScript strict checking
});

// Add system log for initialization
storage.addSystemLog(
  'info' as any,
  'stripe-service',
  'Stripe payment service initialized'
);

/**
 * Create a payment intent for a booking
 */
export async function createPaymentIntent(
  amount: number,
  bookingId: number,
  metadata: Record<string, string> = {},
  testMode: boolean = false
) {
  try {
    if (testMode) {
      // In test mode, we don't create a real payment intent
      // We just return a success response with a mock client secret
      return {
        success: true,
        clientSecret: `test_secret_${Date.now()}`,
        amount,
        id: `test_pi_${Date.now()}`,
        testMode: true,
      };
    }

    // Real payment intent creation
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents/smallest currency unit
      currency: 'eur',
      payment_method_types: ['card'],
      metadata: {
        bookingId: bookingId.toString(),
        ...metadata,
      },
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      amount,
      id: paymentIntent.id,
      testMode: false,
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    await storage.addSystemLog(
      'error' as any,
      'stripe-service',
      `Failed to create payment intent: ${error instanceof Error ? error.message : String(error)}`
    );
    
    throw error;
  }
}

/**
 * Create a checkout session for a booking (external payment page)
 */
export async function createCheckoutSession(
  amount: number,
  bookingId: number,
  customerEmail: string,
  successUrl: string,
  cancelUrl: string,
  metadata: Record<string, string> = {},
  testMode: boolean = false
) {
  try {
    if (testMode) {
      // In test mode, simulate a checkout session
      return {
        success: true,
        url: `${successUrl}?session_id=test_session_${Date.now()}`,
        sessionId: `test_session_${Date.now()}`,
        testMode: true,
      };
    }

    // Create a real checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Flight Reservation',
              description: `Booking ID: ${bookingId}`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      metadata: {
        bookingId: bookingId.toString(),
        ...metadata,
      },
    });

    return {
      success: true,
      url: session.url,
      sessionId: session.id,
      testMode: false,
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    await storage.addSystemLog(
      'error' as any,
      'stripe-service',
      `Failed to create checkout session: ${error instanceof Error ? error.message : String(error)}`
    );
    
    throw error;
  }
}

/**
 * Verify a payment intent
 */
export async function verifyPaymentIntent(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    return {
      success: true,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100, // Convert from cents
      metadata: paymentIntent.metadata,
    };
  } catch (error) {
    console.error('Error verifying payment intent:', error);
    await storage.addSystemLog(
      'error' as any,
      'stripe-service',
      `Failed to verify payment intent: ${error instanceof Error ? error.message : String(error)}`
    );
    
    throw error;
  }
}

/**
 * Verify a checkout session
 */
export async function verifyCheckoutSession(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    return {
      success: true,
      status: session.payment_status,
      amount: session.amount_total ? session.amount_total / 100 : 0, // Convert from cents
      metadata: session.metadata,
    };
  } catch (error) {
    console.error('Error verifying checkout session:', error);
    await storage.addSystemLog(
      'error' as any,
      'stripe-service',
      `Failed to verify checkout session: ${error instanceof Error ? error.message : String(error)}`
    );
    
    throw error;
  }
}