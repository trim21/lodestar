import {ContainerType, ListCompositeType, ByteVectorType, UintBigintType} from "@chainsafe/ssz";
import {
  FIELD_ELEMENTS_PER_BLOB,
  MAX_BLOBS_PER_BLOCK,
  MAX_REQUEST_BLOCKS,
  BYTES_PER_FIELD_ELEMENT,
} from "@lodestar/params";
import {ssz as primitiveSsz} from "../primitive/index.js";
import {ssz as phase0Ssz} from "../phase0/index.js";
import {ssz as altairSsz} from "../altair/index.js";
import {ssz as capellaSsz} from "../capella/index.js";

const {UintNum64, Slot, Root, BLSSignature, GenesisTime, DepositIndex} = primitiveSsz;

// TODO: Remove casting once fix is merged https://github.com/ChainSafe/ssz/pull/288
export const ExcessDataGas = UintBigintType.named(32 as 8, {typeName: "ExcessDataGas"});
export const G1Point = ByteVectorType.named(48, {typeName: "G1Point"});
export const G2Point = ByteVectorType.named(96, {typeName: "G2Point"});
export const BLSFieldElement = ByteVectorType.named(32, {typeName: "BLSFieldElement"});
export const KZGCommitment = ByteVectorType.named(48, {typeName: "KZGCommitment"});
export const KZGProof = ByteVectorType.named(48, {typeName: "KZGProof"});
export const VersionedHash = ByteVectorType.named(32, {typeName: "VersionedHash"});
export const Blob = ByteVectorType.named(BYTES_PER_FIELD_ELEMENT * FIELD_ELEMENTS_PER_BLOB, {typeName: "Blob"});
export const Blobs = ListCompositeType.named(Blob, MAX_BLOBS_PER_BLOCK, {typeName: "Blobs"});
export const BlobKzgCommitments = ListCompositeType.named(KZGCommitment, MAX_BLOBS_PER_BLOCK, {
  typeName: "BlobKzgCommitments",
});

// Constants

// Validator types
// https://github.com/ethereum/consensus-specs/blob/dev/specs/eip4844/validator.md

// A polynomial in evaluation form
export const Polynomial = ListCompositeType.named(BLSFieldElement, FIELD_ELEMENTS_PER_BLOB, {typeName: "Polynomial"});

// class BlobsAndCommitments(Container):
//     blobs: List[Blob, MAX_BLOBS_PER_BLOCK]
//     kzg_commitments: List[KZGCommitment, MAX_BLOBS_PER_BLOCK]
export const BlobsAndCommitments = ContainerType.named(
  {
    blobs: Blobs,
    kzgCommitments: BlobKzgCommitments,
  },
  {typeName: "BlobsAndCommitments", jsonCase: "eth2"}
);

// class PolynomialAndCommitment(Container):
//     polynomial: Polynomial
//     kzg_commitment: KZGCommitment
export const PolynomialAndCommitment = ContainerType.named(
  {
    polynomial: Polynomial,
    kzgCommitment: KZGCommitment,
  },
  {typeName: "PolynomialAndCommitment", jsonCase: "eth2"}
);

// ReqResp types
// =============

export const BlobsSidecarsByRangeRequest = ContainerType.named(
  {
    startSlot: Slot,
    count: UintNum64,
  },
  {typeName: "BlobsSidecarsByRangeRequest", jsonCase: "eth2"}
);

export const BeaconBlockAndBlobsSidecarByRootRequest = ListCompositeType.named(Root, MAX_REQUEST_BLOCKS, {
  typeName: "BeaconBlockAndBlobsSidecarByRootRequest",
});

// Beacon Chain types
// https://github.com/ethereum/consensus-specs/blob/dev/specs/eip4844/beacon-chain.md#containers

export const ExecutionPayload = ContainerType.named(
  {
    ...capellaSsz.ExecutionPayload.fields,
    excessDataGas: ExcessDataGas, // New in EIP-4844
  },
  {typeName: "ExecutionPayloadEIP4844", jsonCase: "eth2"}
);

export const BlindedExecutionPayload = ContainerType.named(
  {
    ...capellaSsz.ExecutionPayloadHeader.fields,
    excessDataGas: ExcessDataGas, // New in EIP-4844
  },
  {typeName: "BlindedExecutionPayloadEIP4844", jsonCase: "eth2"}
);

export const ExecutionPayloadHeader = ContainerType.named(
  {
    ...capellaSsz.ExecutionPayloadHeader.fields,
    excessDataGas: ExcessDataGas, // New in EIP-4844
  },
  {typeName: "ExecutionPayloadHeaderEIP4844", jsonCase: "eth2"}
);

// We have to preserve Fields ordering while changing the type of ExecutionPayload
export const BeaconBlockBody = ContainerType.named(
  {
    ...altairSsz.BeaconBlockBody.fields,
    executionPayload: ExecutionPayload, // Modified in EIP-4844
    blsToExecutionChanges: capellaSsz.BeaconBlockBody.fields.blsToExecutionChanges,
    blobKzgCommitments: BlobKzgCommitments, // New in EIP-4844
  },
  {typeName: "BeaconBlockBodyEIP4844", jsonCase: "eth2", cachePermanentRootStruct: true}
);

export const BeaconBlock = ContainerType.named(
  {
    ...capellaSsz.BeaconBlock.fields,
    body: BeaconBlockBody, // Modified in EIP-4844
  },
  {typeName: "BeaconBlockEIP4844", jsonCase: "eth2", cachePermanentRootStruct: true}
);

export const SignedBeaconBlock = ContainerType.named(
  {
    message: BeaconBlock, // Modified in EIP-4844
    signature: BLSSignature,
  },
  {typeName: "SignedBeaconBlockEIP4844", jsonCase: "eth2"}
);

export const BlobsSidecar = ContainerType.named(
  {
    beaconBlockRoot: Root,
    beaconBlockSlot: Slot,
    blobs: Blobs,
    kzgAggregatedProof: KZGProof,
  },
  {typeName: "BlobsSidecar", jsonCase: "eth2"}
);

export const SignedBeaconBlockAndBlobsSidecar = ContainerType.named(
  {
    beaconBlock: SignedBeaconBlock,
    blobsSidecar: BlobsSidecar,
  },
  {typeName: "SignedBeaconBlockAndBlobsSidecarEIP4844", jsonCase: "eth2"}
);

export const BlindedBeaconBlockBody = ContainerType.named(
  {
    ...BeaconBlockBody.fields,
    executionPayloadHeader: ExecutionPayloadHeader, // Modified in EIP-4844
  },
  {typeName: "BlindedBeaconBlockBodyEIP4844", jsonCase: "eth2", cachePermanentRootStruct: true}
);

export const BlindedBeaconBlock = ContainerType.named(
  {
    ...capellaSsz.BlindedBeaconBlock.fields,
    body: BlindedBeaconBlockBody, // Modified in EIP-4844
  },
  {typeName: "BlindedBeaconBlockEIP4844", jsonCase: "eth2", cachePermanentRootStruct: true}
);

export const SignedBlindedBeaconBlock = ContainerType.named(
  {
    message: BlindedBeaconBlock, // Modified in EIP-4844
    signature: BLSSignature,
  },
  {typeName: "SignedBlindedBeaconBlockEIP4844", jsonCase: "eth2"}
);

// We don't spread capella.BeaconState fields since we need to replace
// latestExecutionPayloadHeader and we cannot keep order doing that
export const BeaconState = ContainerType.named(
  {
    genesisTime: GenesisTime,
    genesisValidatorsRoot: Root,
    slot: primitiveSsz.Slot,
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
    latestExecutionPayloadHeader: ExecutionPayloadHeader, // Modified in EIP-4844
    // Withdrawals
    nextWithdrawalIndex: capellaSsz.BeaconState.fields.nextWithdrawalIndex,
    nextWithdrawalValidatorIndex: capellaSsz.BeaconState.fields.nextWithdrawalValidatorIndex,
  },
  {typeName: "BeaconStateEIP4844", jsonCase: "eth2"}
);
