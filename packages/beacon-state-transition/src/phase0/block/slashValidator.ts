import {allForks, phase0, ValidatorIndex} from "@chainsafe/lodestar-types";
import {
  EPOCHS_PER_SLASHINGS_VECTOR,
  MIN_SLASHING_PENALTY_QUOTIENT,
  PROPOSER_REWARD_QUOTIENT,
  WHISTLEBLOWER_REWARD_QUOTIENT,
} from "@chainsafe/lodestar-params";

import {decreaseBalance, increaseBalance} from "../../util";
import {CachedBeaconState} from "../../allForks/util";
import {initiateValidatorExit} from "../../allForks/block";

export function slashValidator(
  state: CachedBeaconState<phase0.BeaconState>,
  slashedIndex: ValidatorIndex,
  whistleblowerIndex?: ValidatorIndex
): void {
  const {validators, epochCtx} = state;
  const epoch = epochCtx.currentShuffling.epoch;
  initiateValidatorExit(state as CachedBeaconState<allForks.BeaconState>, slashedIndex);
  const validator = validators[slashedIndex];
  validators.update(slashedIndex, {
    slashed: true,
    withdrawableEpoch: Math.max(validator.withdrawableEpoch, epoch + EPOCHS_PER_SLASHINGS_VECTOR),
  });
  state.slashings[epoch % EPOCHS_PER_SLASHINGS_VECTOR] += validator.effectiveBalance;
  decreaseBalance(state, slashedIndex, validator.effectiveBalance / BigInt(MIN_SLASHING_PENALTY_QUOTIENT));

  // apply proposer and whistleblower rewards
  const proposerIndex = epochCtx.getBeaconProposer(state.slot);
  if (whistleblowerIndex === undefined || !Number.isSafeInteger(whistleblowerIndex)) {
    whistleblowerIndex = proposerIndex;
  }
  const whistleblowerReward = validator.effectiveBalance / BigInt(WHISTLEBLOWER_REWARD_QUOTIENT);
  const proposerReward = whistleblowerReward / BigInt(PROPOSER_REWARD_QUOTIENT);
  increaseBalance(state, proposerIndex, proposerReward);
  increaseBalance(state, whistleblowerIndex, whistleblowerReward - proposerReward);
}
