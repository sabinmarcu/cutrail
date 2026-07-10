import {
  useClippingState,
  useClippingSubscriptions,
} from '@renderer/core/clipping';

type EditorWindowClippingBridgeProps = {
  initialSourcePath?: string;
};

export const EditorWindowClippingBridge = ({ initialSourcePath = '' }: EditorWindowClippingBridgeProps) => {
  const state = useClippingState({ initialSourcePath });

  useClippingSubscriptions({
    state,
  });

  return null;
};
