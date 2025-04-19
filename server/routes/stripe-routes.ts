import { Request, Response, Router } from 'express';
import { storage } from '../storage';
import { LogLevel } from '@shared/schema';
import { 
  createPaymentIntent, 
  createCheckoutSession, 
  verifyPaymentIntent,
  verifyCheckoutSession,
} from '../services/stripe-service';

// Create a router for Stripe payment routes
const router = Router();

// Create a payment intent
router.post('/create-payment-intent', async (req: Request, res: Response) => {
  try {
    const { bookingId, testMode = false } = req.body;
    
    if (!bookingId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Booking ID is required' 
      });
    }
    
    // Get the booking from the database
    const booking = await storage.getBooking(bookingId);
    
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }
    
    // Create a payment intent with the booking's total price
    const paymentIntent = await createPaymentIntent(
      booking.totalPrice, 
      booking.id,
      {
        bookingReference: booking.bookingReference,
        currency: booking.currency,
      },
      testMode
    );
    
    // Log the payment intent creation
    await storage.addSystemLog(
      'info' as any,
      'payment-service',
      `Payment intent created for booking ${booking.id} with reference ${booking.bookingReference}`
    );
    
    res.status(200).json(paymentIntent);
  } catch (error) {
    console.error('Error creating payment intent:', error);
    
    // Log the error
    await storage.addSystemLog(
      'error' as any,
      'payment-service',
      `Error creating payment intent: ${error instanceof Error ? error.message : String(error)}`
    );
    
    res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'An error occurred creating the payment intent',
    });
  }
});

// Create a checkout session (external payment link)
router.post('/create-checkout-session', async (req: Request, res: Response) => {
  try {
    const { 
      bookingId, 
      successUrl,
      cancelUrl,
      testMode = false 
    } = req.body;
    
    if (!bookingId || !successUrl || !cancelUrl) {
      return res.status(400).json({ 
        success: false, 
        message: 'Booking ID, success URL, and cancel URL are required' 
      });
    }
    
    // Get the booking from the database
    const booking = await storage.getBooking(bookingId);
    
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    // Get customer email from booking
    const customerEmail = booking.contactEmail;
    if (!customerEmail) {
      return res.status(400).json({
        success: false,
        message: 'Booking must have a contact email for checkout'
      });
    }
    
    // Create a checkout session
    const checkoutSession = await createCheckoutSession(
      booking.totalPrice,
      booking.id,
      customerEmail,
      successUrl,
      cancelUrl,
      {
        bookingReference: booking.bookingReference,
        currency: booking.currency,
      },
      testMode
    );
    
    // Log the checkout session creation
    await storage.addSystemLog(
      'info' as any,
      'payment-service',
      `Checkout session created for booking ${booking.id} with reference ${booking.bookingReference}`
    );
    
    res.status(200).json(checkoutSession);
  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    // Log the error
    await storage.addSystemLog(
      'error' as any,
      'payment-service',
      `Error creating checkout session: ${error instanceof Error ? error.message : String(error)}`
    );
    
    res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'An error occurred creating the checkout session',
    });
  }
});

// Verify a payment intent
router.get('/verify-payment-intent/:paymentIntentId', async (req: Request, res: Response) => {
  try {
    const { paymentIntentId } = req.params;
    
    if (!paymentIntentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment intent ID is required'
      });
    }
    
    const verification = await verifyPaymentIntent(paymentIntentId);
    
    // Update the booking payment status if needed
    if (verification.success && verification.status === 'succeeded') {
      const bookingId = verification.metadata?.bookingId;
      
      if (bookingId) {
        await storage.updateBooking(parseInt(bookingId), {
          status: 'confirmed',
          paymentId: paymentIntentId,
        });
      }
    }
    
    res.status(200).json(verification);
  } catch (error) {
    console.error('Error verifying payment intent:', error);
    
    res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'An error occurred verifying the payment intent',
    });
  }
});

// Verify a checkout session
router.get('/verify-checkout-session/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Session ID is required'
      });
    }
    
    const verification = await verifyCheckoutSession(sessionId);
    
    // Update the booking payment status if needed
    if (verification.success && verification.status === 'paid') {
      const bookingId = verification.metadata?.bookingId;
      
      if (bookingId) {
        await storage.updateBooking(parseInt(bookingId), {
          status: 'confirmed',
          paymentId: sessionId,
        });
      }
    }
    
    res.status(200).json(verification);
  } catch (error) {
    console.error('Error verifying checkout session:', error);
    
    res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'An error occurred verifying the checkout session',
    });
  }
});

// Get booking information from a session ID
router.get('/session/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Session ID is required'
      });
    }
    
    // Verify the checkout session
    const verification = await verifyCheckoutSession(sessionId);
    
    // Update the booking payment status if needed
    if (verification.success && verification.status === 'paid') {
      const bookingId = verification.metadata?.bookingId;
      
      if (bookingId) {
        // Update booking status to confirmed
        await storage.updateBooking(parseInt(bookingId), {
          status: 'confirmed',
          paymentId: sessionId,
        });
        
        // Log the successful payment
        await storage.addSystemLog(
          'info' as any,
          'payment-service',
          `Payment completed successfully for booking ID ${bookingId}`
        );
        
        // Return the booking ID
        return res.status(200).json({
          success: true,
          bookingId: parseInt(bookingId),
          status: 'paid'
        });
      }
    }
    
    // If the session doesn't contain a booking ID or isn't paid
    if (!verification.metadata?.bookingId) {
      return res.status(404).json({
        success: false,
        message: 'No booking associated with this session'
      });
    }
    
    if (verification.status !== 'paid') {
      return res.status(200).json({
        success: false,
        bookingId: parseInt(verification.metadata.bookingId),
        status: verification.status
      });
    }
    
    res.status(200).json(verification);
  } catch (error) {
    console.error('Error retrieving session information:', error);
    
    // Log the error
    await storage.addSystemLog(
      'error' as any,
      'payment-service',
      `Error retrieving session information: ${error instanceof Error ? error.message : String(error)}`
    );
    
    res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'An error occurred retrieving session information',
    });
  }
});

// Webhook endpoint for Stripe events
router.post('/webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  
  try {
    // For simplicity, just acknowledge the webhook for now
    // In a production environment, you would verify the signature and handle events properly
    
    // Log the webhook event
    await storage.addSystemLog(
      'info' as any,
      'payment-service',
      `Stripe webhook event received`
    );
    
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error handling Stripe webhook:', error);
    
    // Log the error
    await storage.addSystemLog(
      'error' as any,
      'payment-service',
      `Error handling Stripe webhook: ${error instanceof Error ? error.message : String(error)}`
    );
    
    res.status(400).json({ success: false });
  }
});

export default router;