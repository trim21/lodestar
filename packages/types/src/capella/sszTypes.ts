import {ListCompositeType, VectorCompositeType} from "@chainsafe/ssz";
import {
  HISTORICAL_ROOTS_LIMIT,
  SLOTS_PER_HISTORICAL_ROOT,
  MAX_WITHDRAWALS_PER_PAYLOAD,
  MAX_BLS_TO_EXECUTION_CHANGES,
} from "@lodestar/params";
import {namedContainerType} from "../utils/namedTypes.js";
import {ssz as primitiveSsz} from "../primitive/index.js";
import {ssz as phase0Ssz} from "../phase0/index.js";
import {ssz as altairSsz} from "../altair/index.js";
import {ssz as bellatrixSsz} from "../bellatrix/index.js";

const {
  UintNum64,
  Slot,
  ValidatorIndex,
  WithdrawalIndex,
  Root,
  BLSSignature,
  BLSPubkey,
  ExecutionAddress,
  Gwei,
} = primitiveSsz;

export const Withdrawal = namedContainerType(
  {
    index: WithdrawalIndex,
    validatorIndex: ValidatorIndex,
    address: ExecutionAddress,
    amount: Gwei,
  },
  {typeName: "Withdrawal", jsonCase: "eth2"}
);

export const BLSToExecutionChange = namedContainerType(
  {
    validatorIndex: ValidatorIndex,
    fromBlsPubkey: BLSPubkey,
    toExecutionAddress: ExecutionAddress,
  },
  {typeName: "BLSToExecutionChange", jsonCase: "eth2"}
);

export const SignedBLSToExecutionChange = namedContainerType(
  {
    message: BLSToExecutionChange,
    signature: BLSSignature,
  },
  {typeName: "SignedBLSToExecutionChange", jsonCase: "eth2"}
);

export const Withdrawals = namedListCompositeType(Withdrawal, MAX_WITHDRAWALS_PER_PAYLOAD);
export const ExecutionPayload = namedContainerType(
  {
    ...bellatrixSsz.ExecutionPayload.fields,
    withdrawals: Withdrawals, // New in capella
  },
  {typeName: "ExecutionPayloadCapella", jsonCase: "eth2"}
);

export const BlindedExecutionPayload = namedContainerType(
  {
    ...bellatrixSsz.ExecutionPayloadHeader.fields,
    withdrawals: Withdrawals, // New in capella
  },
  {typeName: "BlindedExecutionPayloadCapella", jsonCase: "eth2"}
);

export const ExecutionPayloadHeader = namedContainerType(
  {
    ...bellatrixSsz.ExecutionPayloadHeader.fields,
    withdrawalsRoot: Root, // New in capella
  },
  {typeName: "ExecutionPayloadHeaderCapella", jsonCase: "eth2"}
);

export const BLSToExecutionChanges = namedListCompositeType(SignedBLSToExecutionChange, MAX_BLS_TO_EXECUTION_CHANGES);
export const BeaconBlockBody = namedContainerType(
  {
    ...altairSsz.BeaconBlockBody.fields,
    executionPayload: ExecutionPayload, // Modified in capella
    blsToExecutionChanges: BLSToExecutionChanges,
  },
  {typeName: "BeaconBlockBodyCapella", jsonCase: "eth2", cachePermanentRootStruct: true}
);

export const BeaconBlock = namedContainerType(
  {
    slot: Slot,
    proposerIndex: ValidatorIndex,
    // Reclare expandedType() with altair block and altair state
    parentRoot: Root,
    stateRoot: Root,
    body: BeaconBlockBody, // Modified in Capella
  },
  {typeName: "BeaconBlockCapella", jsonCase: "eth2", cachePermanentRootStruct: true}
);

export const SignedBeaconBlock = namedContainerType(
  {
    message: BeaconBlock, // Modified in capella
    signature: BLSSignature,
  },
  {typeName: "SignedBeaconBlockCapella", jsonCase: "eth2"}
);

// Re-declare with the new expanded type
export const HistoricalBlockRoots = namedVectorCompositeType(Root, SLOTS_PER_HISTORICAL_ROOT);
export const HistoricalStateRoots = namedVectorCompositeType(Root, SLOTS_PER_HISTORICAL_ROOT);

export const HistoricalBatch = namedContainerType(
  {
    blockRoots: HistoricalBlockRoots,
    stateRoots: HistoricalStateRoots,
  },
  {typeName: "HistoricalBatch", jsonCase: "eth2"}
);

// we don't reuse bellatrix.BeaconState fields since we need to replace some keys
// and we cannot keep order doing that
export const BeaconState = namedContainerType(
  {
    genesisTime: GenesisTime,
    genesisValidatorsRoot: Root,
    slot: primitiveSsz.Slot,
    fork: phase0Ssz.Fork,
    // History
    latestBlockHeader: phase0Ssz.BeaconBlockHeader,
    blockRoots: HistoricalBlockRoots,
    stateRoots: HistoricalStateRoots,
    historicalRoots: namedListCompositeType(Root, HISTORICAL_ROOTS_LIMIT),
    // Eth1
    eth1Data: phase0Ssz.Eth1Data,
    eth1DataVotes: phase0Ssz.Eth1DataVotes,
    eth1DepositIndex: DepositIndex,
    // Registry
    validators: phase0Ssz.Validators,
    balances: phase0Ssz.Balances,
    randaoMixes: phase0Ssz.RandaoMixes,
    // Slashings
    slashings: phase0Ssz.Slashings,
    // Participation
    previousEpochParticipation: altairSsz.EpochParticipation,
    currentEpochParticipation: altairSsz.EpochParticipation,
    // Finality
    justificationBits: phase0Ssz.JustificationBits,
    previousJustifiedCheckpoint: phase0Ssz.Checkpoint,
    currentJustifiedCheckpoint: phase0Ssz.Checkpoint,
    finalizedCheckpoint: phase0Ssz.Checkpoint,
    // Inactivity
    inactivityScores: altairSsz.InactivityScores,
    // Sync
    currentSyncCommittee: altairSsz.SyncCommittee,
    nextSyncCommittee: altairSsz.SyncCommittee,
    // Execution
    latestExecutionPayloadHeader: ExecutionPayloadHeader, // [Modified in Capella]
    // Withdrawals
    nextWithdrawalIndex: WithdrawalIndex, // [New in Capella]
    nextWithdrawalValidatorIndex: ValidatorIndex, // [New in Capella]
  },
  {typeName: "BeaconStateCapella", jsonCase: "eth2"}
);

export const BlindedBeaconBlockBody = namedContainerType(
  {
    ...altairSsz.BeaconBlockBody.fields,
    executionPayloadHeader: BlindedExecutionPayload, // Modified in capella
    blsToExecutionChanges: BLSToExecutionChanges, // New in capella
  },
  {typeName: "BlindedBeaconBlockBodyCapella", jsonCase: "eth2", cachePermanentRootStruct: true}
);

export const BlindedBeaconBlock = namedContainerType(
  {
    slot: Slot,
    proposerIndex: ValidatorIndex,
    // Reclare expandedType() with altair block and altair state
    parentRoot: Root,
    stateRoot: Root,
    body: BlindedBeaconBlockBody, // Modified in capella
  },
  {typeName: "BlindedBeaconBlockCapella", jsonCase: "eth2", cachePermanentRootStruct: true}
);

export const SignedBlindedBeaconBlock = namedContainerType(
  {
    message: BlindedBeaconBlock, // Modified in capella
    signature: BLSSignature,
  },
  {typeName: "SignedBlindedBeaconBlockCapella", jsonCase: "eth2"}
);
