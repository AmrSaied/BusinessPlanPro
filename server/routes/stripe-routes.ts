import { Request, Response } from "express";
import { z } from "zod";
import { stripeService } from "../services/stripe-service";
import { storage } from "../storage";

// Create a payment intent
export async function createPaymentIntent(req: Request, res: Response) {
  try {
    const { bookingId, testMode } = req.body;
    
    // Check if booking exists
    const booking = await storage.getBooking(parseInt(bookingId));
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    
    // Get flight for payment description
    const flight = await storage.getFlight(booking.flightId);
    if (!flight) {
      return res.status(404).json({ error: "Flight not found" });
    }

    // Get passenger count for this booking
    const passengers = await storage.getPassengersByBookingId(booking.id);
    const passengerCount = passengers.length || 1; // Default to 1 if no passengers found
    
    // If test mode is enabled, return a simulated payment intent
    if (testMode === true) {
      return res.json({
        success: true,
        mode: "test",
        clientSecret: null,
        bookingId: booking.id,
        amount: booking.totalPrice,
        currency: booking.currency || "EUR",
        id: `test_pi_${Math.random().toString(36).substring(2, 10)}`,
        status: "succeeded"
      });
    }
    
    // Create a real Stripe payment intent
    const paymentIntent = await stripeService.createPaymentIntent({
      bookingId: booking.id,
      amount: booking.totalPrice,
      currency: booking.currency || "EUR",
      description: stripeService.generatePaymentDescription(flight, booking, passengerCount),
      receiptEmail: booking.contactEmail
    });
    
    return res.json({
      success: true,
      mode: "real",
      clientSecret: paymentIntent.clientSecret,
      bookingId: booking.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      id: paymentIntent.id,
      status: paymentIntent.status
    });
  } catch (error: any) {
    console.error("Error creating payment intent:", error);
    return res.status(500).json({ 
      error: "Failed to create payment intent", 
      message: error.message 
    });
  }
}

// Confirm a payment (test mode or real)
export async function confirmPayment(req: Request, res: Response) {
  try {
    const { bookingId, paymentIntentId, paymentMethodId, testMode } = req.body;
    
    // Check if booking exists
    const booking = await storage.getBooking(parseInt(bookingId));
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    
    // If test mode, simulate a payment confirmation
    if (testMode === true) {
      // Update booking status
      await storage.updateBooking(booking.id, {
        status: "confirmed",
        paymentId: paymentIntentId || `test_payment_${Date.now()}`
      });
      
      return res.json({
        success: true,
        mode: "test",
        paymentId: paymentIntentId || `test_payment_${Date.now()}`,
        status: "succeeded"
      });
    }
    
    // For real payments, confirm the payment intent
    if (!paymentIntentId || !paymentMethodId) {
      return res.status(400).json({ 
        error: "Missing required fields", 
        message: "paymentIntentId and paymentMethodId are required for real payments" 
      });
    }
    
    const paymentResult = await stripeService.confirmPaymentIntent(
      paymentIntentId,
      paymentMethodId
    );
    
    // Update booking with payment info
    await storage.updateBooking(booking.id, {
      status: "confirmed",
      paymentId: paymentResult.id
    });
    
    return res.json({
      success: true,
      mode: "real",
      paymentId: paymentResult.id,
      status: paymentResult.status
    });
  } catch (error: any) {
    console.error("Error confirming payment:", error);
    return res.status(500).json({ 
      error: "Payment confirmation failed", 
      message: error.message 
    });
  }
}

// Retrieve payment intent status
export async function getPaymentStatus(req: Request, res: Response) {
  try {
    const { paymentIntentId, testMode } = req.query;
    
    // For test mode, return simulated status
    if (testMode === "true") {
      return res.json({
        success: true,
        mode: "test",
        status: "succeeded",
        id: paymentIntentId
      });
    }
    
    if (typeof paymentIntentId !== "string") {
      return res.status(400).json({ error: "Invalid payment intent ID" });
    }
    
    // Get real payment status from Stripe
    const paymentIntent = await stripeService.getPaymentIntent(paymentIntentId);
    
    return res.json({
      success: true,
      mode: "real",
      status: paymentIntent.status,
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    });
  } catch (error: any) {
    console.error("Error getting payment status:", error);
    return res.status(500).json({ 
      error: "Failed to get payment status", 
      message: error.message 
    });
  }
}