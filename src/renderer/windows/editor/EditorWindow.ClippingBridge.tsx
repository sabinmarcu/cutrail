import {
  useClippingActions,
  useClippingState,
  useClippingSubscriptions,
} from '@renderer/core/clipping';

type EditorWindowClippingBridgeProps = {
  initialSourcePath?: string;
};

export const EditorWindowClippingBridge = ({ initialSourcePath = '' }: EditorWindowClippingBridgeProps) => {
  const state = useClippingState({ initialSourcePath });
  const actions = useClippingActions(state);

  useClippingSubscriptions({
    actions,
    state,
  });

  return null;
};
