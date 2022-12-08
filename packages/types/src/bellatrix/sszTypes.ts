import {ByteListType, ByteVectorType, ListCompositeType, VectorCompositeType} from "@chainsafe/ssz";
import {
  BYTES_PER_LOGS_BLOOM,
  HISTORICAL_ROOTS_LIMIT,
  MAX_TRANSACTIONS_PER_PAYLOAD,
  MAX_BYTES_PER_TRANSACTION,
  MAX_EXTRA_DATA_BYTES,
  SLOTS_PER_HISTORICAL_ROOT,
} from "@lodestar/params";
import {ssz as primitiveSsz} from "../primitive/index.js";
import {ssz as phase0Ssz} from "../phase0/index.js";
import {ssz as altairSsz} from "../altair/index.js";
import {namedContainerType} from "../utils/namedTypes.js";

const {
  Bytes32,
  UintNum64,
  Slot,
  ValidatorIndex,
  Root,
  BLSSignature,
  UintBn256: Uint256,
  BLSPubkey,
  ExecutionAddress,
} = primitiveSsz;

/**
 * ByteList[MAX_BYTES_PER_TRANSACTION]
 *
 * Spec v1.0.1
 */
export const Transaction = new ByteListType(MAX_BYTES_PER_TRANSACTION);

/**
 * Union[OpaqueTransaction]
 *
 * Spec v1.0.1
 */
export const Transactions = namedListCompositeType(Transaction, MAX_TRANSACTIONS_PER_PAYLOAD);

const executionPayloadFields = {
  parentHash: Root,
  feeRecipient: ExecutionAddress,
  stateRoot: Bytes32,
  receiptsRoot: Bytes32,
  logsBloom: new ByteVectorType(BYTES_PER_LOGS_BLOOM),
  prevRandao: Bytes32,
  blockNumber: UintNum64,
  gasLimit: UintNum64,
  gasUsed: UintNum64,
  timestamp: UintNum64,
  // TODO: if there is perf issue, consider making ByteListType
  extraData: new ByteListType(MAX_EXTRA_DATA_BYTES),
  baseFeePerGas: Uint256,
  // Extra payload fields
  blockHash: Root,
};

export const ExecutionPayload = namedContainerType(
  {
    ...executionPayloadFields,
    transactions: Transactions,
  },
  {typeName: "ExecutionPayloadBellatrix", jsonCase: "eth2"}
);

export const ExecutionPayloadHeader = namedContainerType(
  {
    ...executionPayloadFields,
    transactionsRoot: Root,
  },
  {typeName: "ExecutionPayloadHeaderBellatrix", jsonCase: "eth2"}
);

export const BeaconBlockBody = namedContainerType(
  {
    ...altairSsz.BeaconBlockBody.fields,
    executionPayload: ExecutionPayload,
  },
  {typeName: "BeaconBlockBodyBellatrix", jsonCase: "eth2", cachePermanentRootStruct: true}
);

export const BeaconBlock = namedContainerType(
  {
    slot: Slot,
    proposerIndex: ValidatorIndex,
    // Reclare expandedType() with altair block and altair state
    parentRoot: Root,
    stateRoot: Root,
    body: BeaconBlockBody,
  },
  {typeName: "BeaconBlockBellatrix", jsonCase: "eth2", cachePermanentRootStruct: true}
);

export const SignedBeaconBlock = namedContainerType(
  {
    message: BeaconBlock,
    signature: BLSSignature,
  },
  {typeName: "SignedBeaconBlockBellatrix", jsonCase: "eth2"}
);

export const PowBlock = namedContainerType(
  {
    blockHash: Root,
    parentHash: Root,
    totalDifficulty: Uint256,
  },
  {typeName: "PowBlock", jsonCase: "eth2"}
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

// we don't reuse phase0.BeaconState fields since we need to replace some keys
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
    latestExecutionPayloadHeader: ExecutionPayloadHeader, // [New in Merge]
  },
  {typeName: "BeaconStateBellatrix", jsonCase: "eth2"}
);

export const BlindedBeaconBlockBody = namedContainerType(
  {
    ...altairSsz.BeaconBlockBody.fields,
    executionPayloadHeader: ExecutionPayloadHeader,
  },
  {typeName: "BlindedBeaconBlockBodyBellatrix", jsonCase: "eth2", cachePermanentRootStruct: true}
);

export const BlindedBeaconBlock = namedContainerType(
  {
    slot: Slot,
    proposerIndex: ValidatorIndex,
    // Reclare expandedType() with altair block and altair state
    parentRoot: Root,
    stateRoot: Root,
    body: BlindedBeaconBlockBody,
  },
  {typeName: "BlindedBeaconBlockBellatrix", jsonCase: "eth2", cachePermanentRootStruct: true}
);

export const SignedBlindedBeaconBlock = namedContainerType(
  {
    message: BlindedBeaconBlock,
    signature: BLSSignature,
  },
  {typeName: "SignedBlindedBeaconBlockBellatrix", jsonCase: "eth2"}
);

export const ValidatorRegistrationV1 = namedContainerType(
  {
    feeRecipient: ExecutionAddress,
    gasLimit: UintNum64,
    timestamp: UintNum64,
    pubkey: BLSPubkey,
  },
  {typeName: "ValidatorRegistrationV1", jsonCase: "eth2"}
);

export const SignedValidatorRegistrationV1 = namedContainerType(
  {
    message: ValidatorRegistrationV1,
    signature: BLSSignature,
  },
  {typeName: "SignedValidatorRegistrationV1", jsonCase: "eth2"}
);

export const BuilderBid = namedContainerType(
  {
    header: ExecutionPayloadHeader,
    value: Uint256,
    pubkey: BLSPubkey,
  },
  {typeName: "BuilderBid", jsonCase: "eth2"}
);

export const SignedBuilderBid = namedContainerType(
  {
    message: BuilderBid,
    signature: BLSSignature,
  },
  {typeName: "SignedBuilderBid", jsonCase: "eth2"}
);
