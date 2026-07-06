import { useMemo } from 'react';
import { ClippingContext } from './clipping.context';
import { useClippingActions } from './clipping.actions';
import { useClippingState } from './clipping.state';
import { useClippingSubscriptions } from './clipping.subscriptions';

export const ClippingProvider = ({ children, initialSourcePath = '' }) => {
  const state = useClippingState({ initialSourcePath });
  const actions = useClippingActions(state);

  useClippingSubscriptions({
    actions,
    state,
  });

  const value = useMemo(() => ({
    ...actions,
    ...state,
  }), [actions, state]);

  return (
    <ClippingContext.Provider value={value}>
      {children}
    </ClippingContext.Provider>
  );
};
