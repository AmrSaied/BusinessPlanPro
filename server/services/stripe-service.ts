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
      // In test mode, simulate a checkout session with bookingId embedded in the session ID
      const testSessionId = `test_session_${Date.now()}_${bookingId}`;
      console.log('Created test session ID with embedded bookingId:', testSessionId);
      
      // For test mode, make sure we directly include booking_id parameter in the success URL
      // The presence of this parameter will allow direct booking retrieval without session verification
      const modifiedSuccessUrl = successUrl;
      
      // Make sure we aren't duplicating the booking_id parameter
      if (!modifiedSuccessUrl.includes('booking_id=')) {
        // Add the booking_id parameter
        const paramConnector = modifiedSuccessUrl.includes('?') ? '&' : '?';
        const enhancedSuccessUrl = `${modifiedSuccessUrl}${paramConnector}booking_id=${bookingId}&session_id=${testSessionId}`;
        console.log('Enhanced test success URL:', enhancedSuccessUrl);
        
        return {
          success: true,
          url: enhancedSuccessUrl,
          sessionId: testSessionId,
          testMode: true,
        };
      }
      
      // If booking_id already exists, just add the session_id
      const paramConnector = modifiedSuccessUrl.includes('?') ? '&' : '?';
      const enhancedSuccessUrl = `${modifiedSuccessUrl}${paramConnector}session_id=${testSessionId}`;
      console.log('Enhanced test success URL (booking_id already present):', enhancedSuccessUrl);
      
      return {
        success: true,
        url: enhancedSuccessUrl,
        sessionId: testSessionId,
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
      // Include the booking ID directly in the success URL for real Stripe sessions too
      success_url: successUrl.includes('?') 
        ? `${successUrl}&session_id={CHECKOUT_SESSION_ID}`
        : `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
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
    // Handle test session IDs
    if (sessionId.startsWith('test_session_')) {
      console.log('Processing test session:', sessionId);
      
      // Extract bookingId from test session ID if it follows a pattern like test_session_[timestamp]_[bookingId]
      let bookingId = null;
      const parts = sessionId.split('_');
      if (parts.length > 3) {
        bookingId = parts[3];
      }
      
      // For test sessions, we'll simulate a successful payment
      return {
        success: true,
        status: 'paid',
        amount: 0,
        metadata: {
          bookingId: bookingId || '0' // Use extracted bookingId or default to 0
        },
      };
    }
    
    // Handle real session IDs
    console.log('Retrieving Stripe session:', sessionId);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('Retrieved session data:', {
      paymentStatus: session.payment_status,
      metadata: session.metadata,
      amountTotal: session.amount_total
    });
    
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
    
    // Return an error result rather than throwing
    return {
      success: false,
      status: 'error',
      amount: 0,
      metadata: null,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}