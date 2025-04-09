import { IStorage } from "../storage";
import { Flight } from "@shared/schema";

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
    
    // For round trips, also get return flights
    let returnFlights;
    if (tripType === "round-trip" && returnDate) {
      returnFlights = await this.storage.getFlights(
        destination,
        origin,
        returnDate
      );
    }
    
    // For one-way trips, don't include the return property at all
    if (tripType === "one-way") {
      return {
        outbound: outboundFlights
      };
    } else {
      return {
        outbound: outboundFlights,
        return: returnFlights
      };
    }
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
