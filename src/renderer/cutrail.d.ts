import type { CutrailBridge } from '../shared/contracts';

declare global {
  interface Window {
    cutrail?: CutrailBridge;
  }

  var cutrail: CutrailBridge | undefined;
}

export {};
