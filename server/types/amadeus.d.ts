declare module 'amadeus' {
  export default class Amadeus {
    constructor(options: {
      clientId: string;
      clientSecret: string;
      hostname?: string;
      customAppId?: string;
      customAppVersion?: string;
      logLevel?: string;
      ssl?: boolean;
    });

    // Client namespaces
    referenceData: {
      locations: {
        get(params: any): Promise<any>;
        airports: {
          get(params: any): Promise<any>;
        };
      };
      urls: {
        checkinLinks: {
          get(params: any): Promise<any>;
        };
      };
    };

    shopping: {
      flightOffersSearch: {
        get(params: any): Promise<any>;
        post(params: any, body: any): Promise<any>;
      };
      flightOffers: {
        pricing: {
          post(params: any, body: any): Promise<any>;
        };
      };
      seatmaps: {
        get(params: any): Promise<any>;
        post(params: any, body: any): Promise<any>;
      };
      hotelOffers: {
        get(params: any): Promise<any>;
      };
      hotelOffersByHotel: {
        get(params: any): Promise<any>;
      };
      hotelOffer(offerId: string): {
        get(params: any): Promise<any>;
      };
    };

    booking: {
      flightOrders: {
        post(params: any, body: any): Promise<any>;
      };
      flightOrder(orderId: string): {
        get(params: any): Promise<any>;
        delete(params: any): Promise<any>;
      };
    };

    // Media types
    readonly AMADEUS_JSON: string;
    readonly AMADEUS_FORM: string;
  }
}