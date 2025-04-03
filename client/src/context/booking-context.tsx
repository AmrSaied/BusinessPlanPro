import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FlightSearch, Flight, InsertBooking, InsertPassenger } from '@shared/schema';

interface BookingData {
  searchParams?: FlightSearch;
  selectedFlight?: Flight;
  options?: {
    expressProcessing: boolean;
    editableTicket: boolean;
    hotelReservation: boolean;
    insuranceLetter: boolean;
  };
  passengers?: InsertPassenger[];
  contactInfo?: {
    email: string;
    phone?: string;
  };
  specialRequests?: string;
  totalPrice?: number;
  booking?: InsertBooking;
  bookingId?: number;
  bookingReference?: string;
}

interface BookingContextType {
  bookingData: BookingData;
  setSearchParams: (params: FlightSearch) => void;
  setSelectedFlight: (flight: Flight) => void;
  setOptions: (options: BookingData['options']) => void;
  setPassengers: (passengers: InsertPassenger[]) => void;
  setContactInfo: (contactInfo: BookingData['contactInfo']) => void;
  setSpecialRequests: (requests: string) => void;
  setTotalPrice: (price: number) => void;
  setBooking: (booking: InsertBooking) => void;
  setBookingId: (id: number) => void;
  setBookingReference: (reference: string) => void;
  resetBookingData: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [bookingData, setBookingData] = useState<BookingData>({});

  const setSearchParams = (params: FlightSearch) => {
    setBookingData(prev => ({ ...prev, searchParams: params }));
  };

  const setSelectedFlight = (flight: Flight) => {
    setBookingData(prev => ({ ...prev, selectedFlight: flight }));
  };

  const setOptions = (options: BookingData['options']) => {
    setBookingData(prev => ({ ...prev, options }));
  };

  const setPassengers = (passengers: InsertPassenger[]) => {
    setBookingData(prev => ({ ...prev, passengers }));
  };

  const setContactInfo = (contactInfo: BookingData['contactInfo']) => {
    setBookingData(prev => ({ ...prev, contactInfo }));
  };

  const setSpecialRequests = (specialRequests: string) => {
    setBookingData(prev => ({ ...prev, specialRequests }));
  };

  const setTotalPrice = (totalPrice: number) => {
    setBookingData(prev => ({ ...prev, totalPrice }));
  };

  const setBooking = (booking: InsertBooking) => {
    setBookingData(prev => ({ ...prev, booking }));
  };

  const setBookingId = (bookingId: number) => {
    setBookingData(prev => ({ ...prev, bookingId }));
  };

  const setBookingReference = (bookingReference: string) => {
    setBookingData(prev => ({ ...prev, bookingReference }));
  };

  const resetBookingData = () => {
    setBookingData({});
  };

  return (
    <BookingContext.Provider
      value={{
        bookingData,
        setSearchParams,
        setSelectedFlight,
        setOptions,
        setPassengers,
        setContactInfo,
        setSpecialRequests,
        setTotalPrice,
        setBooking,
        setBookingId,
        setBookingReference,
        resetBookingData,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
