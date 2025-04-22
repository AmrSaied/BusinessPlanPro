import { IStorage } from "../storage";
import { Flight, FlightPricing } from "@shared/schema";

export class FlightService {
  private storage: IStorage;
  
  constructor(storage: IStorage) {
    this.storage = storage;
  }
  
  async searchFlights(
    origin: string,
    destination: string,
    departureDate: string,
    returnDate?: string,
    tripType: "one-way" | "round-trip" = "one-way"
  ): Promise<{ outbound: Flight[], return?: Flight[] }> {
    // Get outbound flights
    const outboundFlights = await this.storage.getFlights(
      origin,
      destination,
      departureDate
    );
    
    // Get pricing from admin panel - Force refresh from database with each call
    console.log("Fetching latest pricing data from database");
    const pricingList = await this.storage.getFlightPricing();
    
    // Apply pricing from admin panel to the flights
    const priceAdjustedFlights = await this.applyPricing(
      outboundFlights, 
      origin, 
      destination, 
      pricingList, 
      tripType
    );
    
    // For round trips, also get return flights
    let returnFlights;
    if (tripType === "round-trip" && returnDate) {
      const rawReturnFlights = await this.storage.getFlights(
        destination,
        origin,
        returnDate
      );
      // Apply pricing to return flights as well
      returnFlights = await this.applyPricing(
        rawReturnFlights, 
        destination, 
        origin, 
        pricingList, 
        tripType
      );
    }
    
    // For one-way trips, don't include the return property at all
    if (tripType === "one-way") {
      return {
        outbound: priceAdjustedFlights
      };
    } else {
      return {
        outbound: priceAdjustedFlights,
        return: returnFlights
      };
    }
  }
  
  // Helper function to apply pricing from admin panel
  private async applyPricing(
    flights: Flight[], 
    origin: string, 
    destination: string, 
    pricingList: FlightPricing[],
    tripType: "one-way" | "round-trip" = "one-way"
  ): Promise<Flight[]> {
    // Only use active pricing rules
    const activePricing = pricingList.filter(p => p.isActive);
    
    console.log(`Applying pricing for ${origin} -> ${destination}, trip type: ${tripType}`);
    console.log(`Available pricing rules: ${activePricing.length}`);
    
    return flights.map(flight => {
      // Start with the flight's original base price
      let priceAdjusted = false;
      let finalPrice = flight.basePrice;
      
      // First, try to find route-specific pricing
      const routeSpecificPricing = activePricing.find(p => 
        p.originAirport !== 'ANY' && 
        p.destinationAirport !== 'ANY' &&
        p.originAirport === origin &&
        p.destinationAirport === destination &&
        p.tripType === tripType
      );
      
      if (routeSpecificPricing) {
        console.log(`Found route-specific pricing for ${origin} -> ${destination}: $${routeSpecificPricing.basePrice}`);
        finalPrice = routeSpecificPricing.basePrice;
        priceAdjusted = true;
      } else {
        // If no route-specific pricing, try to find standard pricing for the trip type
        const standardPricing = activePricing.find(p => 
          p.originAirport === 'ANY' && 
          p.destinationAirport === 'ANY' &&
          p.tripType === tripType
        );
        
        if (standardPricing) {
          console.log(`Found standard pricing for trip type ${tripType}: $${standardPricing.basePrice}`);
          finalPrice = standardPricing.basePrice;
          priceAdjusted = true;
        } else {
          console.log(`No pricing rule found, using default price: $${finalPrice}`);
        }
      }
      
      // Return the flight with adjusted price
      const updatedFlight = {
        ...flight,
        price: finalPrice,
        priceSource: priceAdjusted ? 'admin' : 'default'
      };
      
      return updatedFlight;
    });
  }
  
  async getFlightById(id: number): Promise<Flight | undefined> {
    return this.storage.getFlight(id);
  }
  
  // Calculate ticket price with options
  calculateTicketPrice(
    basePrice: number, 
    options: {
      expressProcessing?: boolean;
      editableTicket?: boolean;
      hotelReservation?: boolean;
      insuranceLetter?: boolean;
    }
  ): number {
    let totalPrice = basePrice;
    
    if (options.expressProcessing) {
      totalPrice += 5;
    }
    
    if (options.editableTicket) {
      totalPrice += 8;
    }
    
    if (options.hotelReservation) {
      totalPrice += 15;
    }
    
    if (options.insuranceLetter) {
      totalPrice += 10;
    }
    
    return totalPrice;
  }
}
