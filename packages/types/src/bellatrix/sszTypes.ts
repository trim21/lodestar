import {
  ByteListType,
  ByteVectorType,
  ContainerType,
  ListCompositeType,
  UintBigintType,
  UintNumberType,
} from "@chainsafe/ssz";
import {
  BYTES_PER_LOGS_BLOOM,
  MAX_TRANSACTIONS_PER_PAYLOAD,
  MAX_BYTES_PER_TRANSACTION,
  MAX_EXTRA_DATA_BYTES,
} from "@lodestar/params";
import {ssz as primitiveSsz} from "../primitive/index.js";
import {ssz as phase0Ssz} from "../phase0/index.js";
import {ssz as altairSsz} from "../altair/index.js";

const {
  UintNum64,
  Slot,
  ValidatorIndex,
  Root,
  BLSSignature,
  UintBn256,
  BLSPubkey,
  ExecutionAddress,
  GenesisTime,
  DepositIndex,
  BlockHash,
} = primitiveSsz;

// Bellatrix

export const ParentHash = ByteVectorType.named(32, {typeName: "ParentHash"});
export const StateRoot = ByteVectorType.named(32, {typeName: "StateRoot"});
export const ReceiptsRoot = ByteVectorType.named(32, {typeName: "ReceiptsRoot"});
export const LogsBloom = ByteVectorType.named(BYTES_PER_LOGS_BLOOM, {typeName: "LogsBloom"});
export const PrevRandao = ByteVectorType.named(32, {typeName: "PrevRandao"});
export const BlockNumber = UintNumberType.named(8, {typeName: "BlockNumber"});
export const GasLimit = UintNumberType.named(8, {typeName: "GasLimit"});
export const GasUsed = UintNumberType.named(8, {typeName: "GasUsed"});
export const Timestamp = UintNumberType.named(8, {typeName: "Timestamp"});
export const ExtraData = ByteListType.named(MAX_EXTRA_DATA_BYTES, {typeName: "ExtraData"});
// TODO: Remove casting once fix is merged https://github.com/ChainSafe/ssz/pull/288
export const BaseFeePerGas = UintBigintType.named(32 as 8, {typeName: "BaseFeePerGas"});

/**
 * ByteList[MAX_BYTES_PER_TRANSACTION]
 *
 * Spec v1.0.1
 */
export const Transaction = ByteListType.named(MAX_BYTES_PER_TRANSACTION, {typeName: "Transaction"});

/**
 * Union[OpaqueTransaction]
 *
 * Spec v1.0.1
 */
export const Transactions = ListCompositeType.named(Transaction, MAX_TRANSACTIONS_PER_PAYLOAD, {
  typeName: "Transactions",
});

const executionPayloadFields = {
  parentHash: ParentHash,
  feeRecipient: ExecutionAddress,
  stateRoot: StateRoot,
  receiptsRoot: ReceiptsRoot,
  logsBloom: LogsBloom,
  prevRandao: PrevRandao,
  blockNumber: BlockNumber,
  gasLimit: GasLimit,
  gasUsed: GasUsed,
  timestamp: Timestamp,
  extraData: ExtraData,
  baseFeePerGas: BaseFeePerGas,
  // Extra payload fields
  blockHash: BlockHash,
};

export const ExecutionPayload = ContainerType.named(
  {
    ...executionPayloadFields,
    transactions: Transactions,
  },
  {typeName: "ExecutionPayloadBellatrix", jsonCase: "eth2"}
);

export const ExecutionPayloadHeader = ContainerType.named(
  {
    ...executionPayloadFields,
    transactionsRoot: Root,
  },
  {typeName: "ExecutionPayloadHeaderBellatrix", jsonCase: "eth2"}
);

export const BeaconBlockBody = ContainerType.named(
  {
    ...altairSsz.BeaconBlockBody.fields,
    executionPayload: ExecutionPayload,
  },
  {typeName: "BeaconBlockBodyBellatrix", jsonCase: "eth2", cachePermanentRootStruct: true}
);

export const BeaconBlock = ContainerType.named(
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

export const SignedBeaconBlock = ContainerType.named(
  {
    message: BeaconBlock,
    signature: BLSSignature,
  },
  {typeName: "SignedBeaconBlockBellatrix", jsonCase: "eth2"}
);

export const PowBlock = ContainerType.named(
  {
    blockHash: Root,
    parentHash: Root,
    totalDifficulty: UintBn256,
  },
  {typeName: "PowBlock", jsonCase: "eth2"}
);

// we don't reuse phase0.BeaconState fields since we need to replace some keys
// and we cannot keep order doing that
export const BeaconState = ContainerType.named(
  {
    genesisTime: GenesisTime,
    genesisValidatorsRoot: Root,
    slot: Slot,
    fork: phase0Ssz.Fork,
    // History
    latestBlockHeader: phase0Ssz.BeaconBlockHeader,
    blockRoots: phase0Ssz.HistoricalBlockRoots,
    stateRoots: phase0Ssz.HistoricalStateRoots,
    historicalRoots: phase0Ssz.HistoricalRoots,
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

export const BlindedBeaconBlockBody = ContainerType.named(
  {
    ...altairSsz.BeaconBlockBody.fields,
    executionPayloadHeader: ExecutionPayloadHeader,
  },
  {typeName: "BlindedBeaconBlockBodyBellatrix", jsonCase: "eth2", cachePermanentRootStruct: true}
);

export const BlindedBeaconBlock = ContainerType.named(
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

export const SignedBlindedBeaconBlock = ContainerType.named(
  {
    message: BlindedBeaconBlock,
    signature: BLSSignature,
  },
  {typeName: "SignedBlindedBeaconBlockBellatrix", jsonCase: "eth2"}
);

export const ValidatorRegistrationV1 = ContainerType.named(
  {
    feeRecipient: ExecutionAddress,
    gasLimit: UintNum64,
    timestamp: UintNum64,
    pubkey: BLSPubkey,
  },
  {typeName: "ValidatorRegistrationV1", jsonCase: "eth2"}
);

export const SignedValidatorRegistrationV1 = ContainerType.named(
  {
    message: ValidatorRegistrationV1,
    signature: BLSSignature,
  },
  {typeName: "SignedValidatorRegistrationV1", jsonCase: "eth2"}
);

export const BuilderBid = ContainerType.named(
  {
    header: ExecutionPayloadHeader,
    value: UintBn256,
    pubkey: BLSPubkey,
  },
  {typeName: "BuilderBid", jsonCase: "eth2"}
);

export const SignedBuilderBid = ContainerType.named(
  {
    message: BuilderBid,
    signature: BLSSignature,
  },
  {typeName: "SignedBuilderBid", jsonCase: "eth2"}
);
