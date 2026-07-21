export type RewardedAdOutcome =
  | "granted"
  | "cancelled"
  | "unavailable"
  | "error";

export interface RewardedAdProvider {
  readonly name: string;
  isAvailable(): boolean;
  show(): Promise<RewardedAdOutcome>;
}

export const noRewardedAdProvider: RewardedAdProvider = {
  name: "none",
  isAvailable: () => false,
  show: async () => "unavailable",
};

export async function runAfterReward(
  provider: RewardedAdProvider,
  action: () => void,
): Promise<RewardedAdOutcome> {
  if (!provider.isAvailable()) {
    action();
    return "unavailable";
  }

  const outcome = await provider.show();
  if (outcome === "granted") action();
  return outcome;
}
