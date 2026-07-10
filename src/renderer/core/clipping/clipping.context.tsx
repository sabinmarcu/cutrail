import {
  createContext,
  useContext,
} from 'react';
import type {
  ClippingActions,
  ClippingStateModel,
} from './clipping.types';

type ClippingContextValue = ClippingStateModel & ClippingActions;

export const ClippingContext = createContext<ClippingContextValue | null>(null);

export const useClippingContext = (): ClippingContextValue => {
  const value = useContext(ClippingContext);

  if (!value) {
    throw new Error('useClippingContext must be used inside ClippingProvider');
  }

  return value;
};
