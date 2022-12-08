import {BitListType, BitVectorType} from "@chainsafe/ssz";
import {
  ATTESTATION_SUBNET_COUNT,
  DEPOSIT_CONTRACT_TREE_DEPTH,
  EPOCHS_PER_ETH1_VOTING_PERIOD,
  EPOCHS_PER_HISTORICAL_VECTOR,
  EPOCHS_PER_SLASHINGS_VECTOR,
  HISTORICAL_ROOTS_LIMIT,
  JUSTIFICATION_BITS_LENGTH,
  MAX_ATTESTATIONS,
  MAX_ATTESTER_SLASHINGS,
  MAX_DEPOSITS,
  MAX_PROPOSER_SLASHINGS,
  MAX_REQUEST_BLOCKS,
  MAX_VALIDATORS_PER_COMMITTEE,
  MAX_VOLUNTARY_EXITS,
  SLOTS_PER_EPOCH,
  SLOTS_PER_HISTORICAL_ROOT,
  VALIDATOR_REGISTRY_LIMIT,
} from "@lodestar/params";
import {
  namedContainerNodeStructType,
  namedContainerType,
  namedListBasicType,
  namedListCompositeType,
  namedVectorBasicType,
  namedVectorCompositeType,
} from "../utils/namedTypes.js";
import * as primitiveSsz from "../primitive/sszTypes.js";

const {
  Boolean,
  Bytes32,
  UintNum64,
  UintBn64,
  Slot,
  Epoch,
  EpochInf,
  CommitteeIndex,
  ValidatorIndex,
  Gwei,
  Root,
  Version,
  ForkDigest,
  BLSPubkey,
  BLSSignature,
  Domain,
  GenesisTime,
  DepositIndex,
} = primitiveSsz;

// Misc types
// ==========

export const AttestationSubnets = new BitVectorType(ATTESTATION_SUBNET_COUNT);

/** BeaconBlockHeader where slot is bounded by the clock, and values above it are invalid */
export const BeaconBlockHeader = namedContainerType(
  {
    slot: Slot,
    proposerIndex: ValidatorIndex,
    parentRoot: Root,
    stateRoot: Root,
    bodyRoot: Root,
  },
  {typeName: "BeaconBlockHeader", jsonCase: "eth2", cachePermanentRootStruct: true}
);

/** BeaconBlockHeader where slot is NOT bounded by the clock, i.e. slashings. So slot is a bigint. */
export const BeaconBlockHeaderBigint = namedContainerType(
  {
    slot: UintBn64,
    proposerIndex: ValidatorIndex,
    parentRoot: Root,
    stateRoot: Root,
    bodyRoot: Root,
  },
  {typeName: "BeaconBlockHeader", jsonCase: "eth2", cachePermanentRootStruct: true}
);

export const SignedBeaconBlockHeader = namedContainerType(
  {
    message: BeaconBlockHeader,
    signature: BLSSignature,
  },
  {typeName: "SignedBeaconBlockHeader", jsonCase: "eth2"}
);

/** Same as `SignedBeaconBlockHeader` but slot is not bounded by the clock and must be a bigint */
export const SignedBeaconBlockHeaderBigint = namedContainerType(
  {
    message: BeaconBlockHeaderBigint,
    signature: BLSSignature,
  },
  {typeName: "SignedBeaconBlockHeader", jsonCase: "eth2"}
);

/** Checkpoint where epoch is bounded by the clock, and values above it are invalid */
export const Checkpoint = namedContainerType(
  {
    epoch: Epoch,
    root: Root,
  },
  {typeName: "Checkpoint", jsonCase: "eth2"}
);

/** Checkpoint where epoch is NOT bounded by the clock, so must be a bigint */
export const CheckpointBigint = namedContainerType(
  {
    epoch: UintBn64,
    root: Root,
  },
  {typeName: "Checkpoint", jsonCase: "eth2"}
);

export const CommitteeBits = new BitListType(MAX_VALIDATORS_PER_COMMITTEE);

export const CommitteeIndices = namedListBasicType(ValidatorIndex, MAX_VALIDATORS_PER_COMMITTEE, {
  typeName: "CommitteeIndices",
});

export const DepositMessage = namedContainerType(
  {
    pubkey: BLSPubkey,
    withdrawalCredentials: Bytes32,
    amount: UintNum64,
  },
  {typeName: "DepositMessage", jsonCase: "eth2"}
);

export const DepositData = namedContainerType(
  {
    pubkey: BLSPubkey,
    withdrawalCredentials: Bytes32,
    amount: UintNum64,
    signature: BLSSignature,
  },
  {typeName: "DepositData", jsonCase: "eth2"}
);

export const DepositDataRootList = namedListCompositeType(Root, 2 ** DEPOSIT_CONTRACT_TREE_DEPTH, {
  typeName: "DepositDataRootList",
});

export const DepositEvent = namedContainerType(
  {
    depositData: DepositData,
    blockNumber: UintNum64,
    index: UintNum64,
  },
  {typeName: "DepositEvent", jsonCase: "eth2"}
);

export const Eth1Data = namedContainerType(
  {
    depositRoot: Root,
    depositCount: UintNum64,
    blockHash: Bytes32,
  },
  {typeName: "Eth1Data", jsonCase: "eth2"}
);

export const Eth1DataVotes = namedListCompositeType(Eth1Data, EPOCHS_PER_ETH1_VOTING_PERIOD * SLOTS_PER_EPOCH, {
  typeName: "Eth1DataVotes",
});

export const Eth1DataOrdered = namedContainerType(
  {
    depositRoot: Root,
    depositCount: UintNum64,
    blockHash: Bytes32,
    blockNumber: UintNum64,
  },
  {typeName: "Eth1DataOrdered", jsonCase: "eth2"}
);

/** Spec'ed but only used in lodestar as a type */
export const Eth1Block = namedContainerType(
  {
    timestamp: UintNum64,
    depositRoot: Root,
    depositCount: UintNum64,
  },
  {typeName: "Eth1Block", jsonCase: "eth2"}
);

export const Fork = namedContainerType(
  {
    previousVersion: Version,
    currentVersion: Version,
    epoch: Epoch,
  },
  {typeName: "Fork", jsonCase: "eth2"}
);

export const ForkData = namedContainerType(
  {
    currentVersion: Version,
    genesisValidatorsRoot: Root,
  },
  {typeName: "ForkData", jsonCase: "eth2"}
);

export const ENRForkID = namedContainerType(
  {
    forkDigest: ForkDigest,
    nextForkVersion: Version,
    nextForkEpoch: Epoch,
  },
  {typeName: "ENRForkID", jsonCase: "eth2"}
);

export const HistoricalBlockRoots = namedVectorCompositeType(Root, SLOTS_PER_HISTORICAL_ROOT, {
  typeName: "HistoricalBlockRoots",
});
export const HistoricalStateRoots = namedVectorCompositeType(Root, SLOTS_PER_HISTORICAL_ROOT, {
  typeName: "HistoricalStateRoots",
});

export const HistoricalBatch = namedContainerType(
  {
    blockRoots: HistoricalBlockRoots,
    stateRoots: HistoricalStateRoots,
  },
  {typeName: "HistoricalBatch", jsonCase: "eth2"}
);

/**
 * Non-spec'ed helper type to allow efficient hashing in epoch transition.
 * This type is like a 'Header' of HistoricalBatch where its fields are hashed.
 */
export const HistoricalBatchRoots = namedContainerType(
  {
    blockRoots: Root, // Hashed HistoricalBlockRoots
    stateRoots: Root, // Hashed HistoricalStateRoots
  },
  {typeName: "HistoricalBatchRoots", jsonCase: "eth2"}
);

export const HistoricalRoots = namedListCompositeType(Root, HISTORICAL_ROOTS_LIMIT, {typeName: "HistoricalRoots"});

export const ValidatorContainer = namedContainerType(
  {
    pubkey: BLSPubkey,
    withdrawalCredentials: Bytes32,
    effectiveBalance: UintNum64,
    slashed: Boolean,
    activationEligibilityEpoch: EpochInf,
    activationEpoch: EpochInf,
    exitEpoch: EpochInf,
    withdrawableEpoch: EpochInf,
  },
  {typeName: "Validator", jsonCase: "eth2"}
);

export const ValidatorNodeStruct = namedContainerNodeStructType(ValidatorContainer.fields, ValidatorContainer.opts);
// The main Validator type is the 'ContainerNodeStructType' version
export const Validator = ValidatorNodeStruct;

// Export as stand-alone for direct tree optimizations
export const Validators = namedListCompositeType(ValidatorNodeStruct, VALIDATOR_REGISTRY_LIMIT, {
  typeName: "Validators",
});
export const Balances = namedListBasicType(UintNum64, VALIDATOR_REGISTRY_LIMIT, {typeName: "Balances"});
export const RandaoMixes = namedVectorCompositeType(Bytes32, EPOCHS_PER_HISTORICAL_VECTOR, {typeName: "RandaoMixes"});
export const Slashings = namedVectorBasicType(Gwei, EPOCHS_PER_SLASHINGS_VECTOR, {typeName: "Slashings"});
export const JustificationBits = new BitVectorType(JUSTIFICATION_BITS_LENGTH);

// Misc dependants

export const AttestationData = namedContainerType(
  {
    slot: Slot,
    index: CommitteeIndex,
    beaconBlockRoot: Root,
    source: Checkpoint,
    target: Checkpoint,
  },
  {typeName: "AttestationData", jsonCase: "eth2", cachePermanentRootStruct: true}
);

/** Same as `AttestationData` but epoch, slot and index are not bounded and must be a bigint */
export const AttestationDataBigint = namedContainerType(
  {
    slot: UintBn64,
    index: UintBn64,
    beaconBlockRoot: Root,
    source: CheckpointBigint,
    target: CheckpointBigint,
  },
  {typeName: "AttestationData", jsonCase: "eth2", cachePermanentRootStruct: true}
);

export const IndexedAttestation = namedContainerType(
  {
    attestingIndices: CommitteeIndices,
    data: AttestationData,
    signature: BLSSignature,
  },
  {typeName: "IndexedAttestation", jsonCase: "eth2"}
);

/** Same as `IndexedAttestation` but epoch, slot and index are not bounded and must be a bigint */
export const IndexedAttestationBigint = namedContainerType(
  {
    attestingIndices: CommitteeIndices,
    data: AttestationDataBigint,
    signature: BLSSignature,
  },
  {typeName: "IndexedAttestation", jsonCase: "eth2"}
);

export const PendingAttestation = namedContainerType(
  {
    aggregationBits: CommitteeBits,
    data: AttestationData,
    inclusionDelay: Slot,
    proposerIndex: ValidatorIndex,
  },
  {typeName: "PendingAttestation", jsonCase: "eth2"}
);

export const SigningData = namedContainerType(
  {
    objectRoot: Root,
    domain: Domain,
  },
  {typeName: "SigningData", jsonCase: "eth2"}
);

// Operations types
// ================

export const Attestation = namedContainerType(
  {
    aggregationBits: CommitteeBits,
    data: AttestationData,
    signature: BLSSignature,
  },
  {typeName: "Attestation", jsonCase: "eth2"}
);

export const AttesterSlashing = namedContainerType(
  {
    // In state transition, AttesterSlashing attestations are only partially validated. Their slot and epoch could
    // be higher than the clock and the slashing would still be valid. Same applies to attestation data index, which
    // can be any arbitrary value. Must use bigint variants to hash correctly to all possible values
    attestation1: IndexedAttestationBigint,
    attestation2: IndexedAttestationBigint,
  },
  {typeName: "AttesterSlashing", jsonCase: "eth2"}
);

export const Deposit = namedContainerType(
  {
    proof: namedVectorCompositeType(Bytes32, DEPOSIT_CONTRACT_TREE_DEPTH + 1, {typeName: "DepositProof"}),
    data: DepositData,
  },
  {typeName: "Deposit", jsonCase: "eth2"}
);

export const ProposerSlashing = namedContainerType(
  {
    // In state transition, ProposerSlashing headers are only partially validated. Their slot could be higher than the
    // clock and the slashing would still be valid. Must use bigint variants to hash correctly to all possible values
    signedHeader1: SignedBeaconBlockHeaderBigint,
    signedHeader2: SignedBeaconBlockHeaderBigint,
  },
  {typeName: "ProposerSlashing", jsonCase: "eth2"}
);

export const VoluntaryExit = namedContainerType(
  {
    epoch: Epoch,
    validatorIndex: ValidatorIndex,
  },
  {typeName: "VoluntaryExit", jsonCase: "eth2", cachePermanentRootStruct: true}
);

export const SignedVoluntaryExit = namedContainerType(
  {
    message: VoluntaryExit,
    signature: BLSSignature,
  },
  {typeName: "SignedVoluntaryExit", jsonCase: "eth2"}
);

// Block types
// ===========

export const BeaconBlockBody = namedContainerType(
  {
    randaoReveal: BLSSignature,
    eth1Data: Eth1Data,
    graffiti: Bytes32,
    proposerSlashings: namedListCompositeType(ProposerSlashing, MAX_PROPOSER_SLASHINGS, {
      typeName: "ProposerSlashings",
    }),
    attesterSlashings: namedListCompositeType(AttesterSlashing, MAX_ATTESTER_SLASHINGS, {
      typeName: "AttesterSlashings",
    }),
    attestations: namedListCompositeType(Attestation, MAX_ATTESTATIONS, {typeName: "Attestations"}),
    deposits: namedListCompositeType(Deposit, MAX_DEPOSITS, {typeName: "Deposits"}),
    voluntaryExits: namedListCompositeType(SignedVoluntaryExit, MAX_VOLUNTARY_EXITS, {typeName: "VoluntaryExits"}),
  },
  {typeName: "BeaconBlockBodyPhase0", jsonCase: "eth2", cachePermanentRootStruct: true}
);

export const BeaconBlock = namedContainerType(
  {
    slot: Slot,
    proposerIndex: ValidatorIndex,
    parentRoot: Root,
    stateRoot: Root,
    body: BeaconBlockBody,
  },
  {typeName: "BeaconBlockPhase0", jsonCase: "eth2", cachePermanentRootStruct: true}
);

export const SignedBeaconBlock = namedContainerType(
  {
    message: BeaconBlock,
    signature: BLSSignature,
  },
  {typeName: "SignedBeaconBlockPhase0", jsonCase: "eth2"}
);

// State types
// ===========

export const EpochAttestations = namedListCompositeType(PendingAttestation, MAX_ATTESTATIONS * SLOTS_PER_EPOCH, {
  typeName: "EpochAttestations",
});

export const BeaconState = namedContainerType(
  {
    // Misc
    genesisTime: GenesisTime,
    genesisValidatorsRoot: Root,
    slot: Slot,
    fork: Fork,
    // History
    latestBlockHeader: BeaconBlockHeader,
    blockRoots: HistoricalBlockRoots,
    stateRoots: HistoricalStateRoots,
    historicalRoots: HistoricalRoots,
    // Eth1
    eth1Data: Eth1Data,
    eth1DataVotes: Eth1DataVotes,
    eth1DepositIndex: DepositIndex,
    // Registry
    validators: Validators,
    balances: Balances,
    randaoMixes: RandaoMixes,
    // Slashings
    slashings: Slashings,
    // Attestations
    previousEpochAttestations: EpochAttestations,
    currentEpochAttestations: EpochAttestations,
    // Finality
    justificationBits: JustificationBits,
    previousJustifiedCheckpoint: Checkpoint,
    currentJustifiedCheckpoint: Checkpoint,
    finalizedCheckpoint: Checkpoint,
  },
  {typeName: "BeaconStatePhase0", jsonCase: "eth2"}
);

// Validator types
// ===============

export const CommitteeAssignment = namedContainerType(
  {
    validators: CommitteeIndices,
    committeeIndex: CommitteeIndex,
    slot: Slot,
  },
  {typeName: "CommitteeAssignment", jsonCase: "eth2"}
);

export const AggregateAndProof = namedContainerType(
  {
    aggregatorIndex: ValidatorIndex,
    aggregate: Attestation,
    selectionProof: BLSSignature,
  },
  {typeName: "AggregateAndProof", jsonCase: "eth2", cachePermanentRootStruct: true}
);

export const SignedAggregateAndProof = namedContainerType(
  {
    message: AggregateAndProof,
    signature: BLSSignature,
  },
  {typeName: "SignedAggregateAndProof", jsonCase: "eth2"}
);

// ReqResp types
// =============

export const Status = namedContainerType(
  {
    forkDigest: ForkDigest,
    finalizedRoot: Root,
    finalizedEpoch: Epoch,
    headRoot: Root,
    headSlot: Slot,
  },
  {typeName: "Status", jsonCase: "eth2"}
);

export const Goodbye = UintBn64;

export const Ping = UintBn64;

export const Metadata = namedContainerType(
  {
    seqNumber: UintBn64,
    attnets: AttestationSubnets,
  },
  {typeName: "Metadata", jsonCase: "eth2"}
);

export const BeaconBlocksByRangeRequest = namedContainerType(
  {
    startSlot: Slot,
    count: UintNum64,
    step: UintNum64,
  },
  {typeName: "BeaconBlocksByRangeRequest", jsonCase: "eth2"}
);

export const BeaconBlocksByRootRequest = namedListCompositeType(Root, MAX_REQUEST_BLOCKS, {
  typeName: "BeaconBlocksByRootRequest",
});

// Api types
// =========

export const Genesis = namedContainerType(
  {
    genesisValidatorsRoot: Root,
    genesisTime: GenesisTime,
    genesisForkVersion: Version,
  },
  {typeName: "Genesis", jsonCase: "eth2"}
);
