import {
  createContext,
  useContext,
} from 'react';

export const ClippingContext = createContext(null);

export const useClippingContext = () => {
  const value = useContext(ClippingContext);

  if (!value) {
    throw new Error('useClippingContext must be used inside ClippingProvider');
  }

  return value;
};
