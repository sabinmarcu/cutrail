import {
  type ReactNode,
  useMemo,
} from 'react';
import { ClippingContext } from './clipping.context';
import { useClippingActions } from './clipping.actions';
import { useClippingState } from './clipping.state';
import { useClippingSubscriptions } from './clipping.subscriptions';
import type {
  ClippingActions,
  ClippingStateModel,
} from './clipping.types';

type ClippingProviderProps = {
  children: ReactNode;
  initialSourcePath?: string;
};

export const ClippingProvider = ({ children, initialSourcePath = '' }: ClippingProviderProps) => {
  const state = useClippingState({ initialSourcePath });
  const actions = useClippingActions(state);

  useClippingSubscriptions({
    state,
  });

  const value = useMemo<ClippingStateModel & ClippingActions>(() => ({
    ...actions,
    ...state,
  }), [actions, state]);

  return (
    <ClippingContext.Provider value={value}>
      {children}
    </ClippingContext.Provider>
  );
};
