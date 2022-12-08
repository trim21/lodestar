import {BitVectorType, ListBasicType, ListCompositeType, VectorCompositeType} from "@chainsafe/ssz";
import {
  FINALIZED_ROOT_DEPTH,
  NEXT_SYNC_COMMITTEE_DEPTH,
  SYNC_COMMITTEE_SUBNET_COUNT,
  SYNC_COMMITTEE_SIZE,
  SLOTS_PER_HISTORICAL_ROOT,
  HISTORICAL_ROOTS_LIMIT,
  VALIDATOR_REGISTRY_LIMIT,
  EPOCHS_PER_SYNC_COMMITTEE_PERIOD,
  SLOTS_PER_EPOCH,
} from "@lodestar/params";
import {namedContainerType} from "../utils/namedTypes.js";
import * as phase0Ssz from "../phase0/sszTypes.js";
import * as primitiveSsz from "../primitive/sszTypes.js";

const {
  Bytes32,
  UintNum64,
  UintBn64,
  Slot,
  SubcommitteeIndex,
  ValidatorIndex,
  Root,
  BLSPubkey,
  BLSSignature,
  ParticipationFlags,
} = primitiveSsz;

export const SyncSubnets = new BitVectorType(SYNC_COMMITTEE_SUBNET_COUNT);

export const Metadata = namedContainerType(
  {
    seqNumber: UintBn64,
    attnets: phase0Ssz.AttestationSubnets,
    syncnets: SyncSubnets,
  },
  {typeName: "MetadataAltair", jsonCase: "eth2"}
);

export const SyncCommittee = namedContainerType(
  {
    pubkeys: namedVectorCompositeType(BLSPubkey, SYNC_COMMITTEE_SIZE),
    aggregatePubkey: BLSPubkey,
  },
  {typeName: "SyncCommittee", jsonCase: "eth2"}
);

export const SyncCommitteeMessage = namedContainerType(
  {
    slot: Slot,
    beaconBlockRoot: Root,
    validatorIndex: ValidatorIndex,
    signature: BLSSignature,
  },
  {typeName: "SyncCommitteeMessage", jsonCase: "eth2"}
);

export const SyncCommitteeContribution = namedContainerType(
  {
    slot: Slot,
    beaconBlockRoot: Root,
    subcommitteeIndex: SubcommitteeIndex,
    aggregationBits: new BitVectorType(SYNC_COMMITTEE_SIZE / SYNC_COMMITTEE_SUBNET_COUNT),
    signature: BLSSignature,
  },
  {typeName: "SyncCommitteeContribution", jsonCase: "eth2"}
);

export const ContributionAndProof = namedContainerType(
  {
    aggregatorIndex: ValidatorIndex,
    contribution: SyncCommitteeContribution,
    selectionProof: BLSSignature,
  },
  {typeName: "ContributionAndProof", jsonCase: "eth2", cachePermanentRootStruct: true}
);

export const SignedContributionAndProof = namedContainerType(
  {
    message: ContributionAndProof,
    signature: BLSSignature,
  },
  {typeName: "SignedContributionAndProof", jsonCase: "eth2"}
);

export const SyncAggregatorSelectionData = namedContainerType(
  {
    slot: Slot,
    subcommitteeIndex: SubcommitteeIndex,
  },
  {typeName: "SyncAggregatorSelectionData", jsonCase: "eth2"}
);

export const SyncCommitteeBits = new BitVectorType(SYNC_COMMITTEE_SIZE);

export const SyncAggregate = namedContainerType(
  {
    syncCommitteeBits: SyncCommitteeBits,
    syncCommitteeSignature: BLSSignature,
  },
  {typeName: "SyncCommittee", jsonCase: "eth2"}
);

export const HistoricalBlockRoots = namedVectorCompositeType(Root, SLOTS_PER_HISTORICAL_ROOT);
export const HistoricalStateRoots = namedVectorCompositeType(Root, SLOTS_PER_HISTORICAL_ROOT);

export const HistoricalBatch = namedContainerType(
  {
    blockRoots: HistoricalBlockRoots,
    stateRoots: HistoricalStateRoots,
  },
  {typeName: "HistoricalBatch", jsonCase: "eth2"}
);

export const BeaconBlockBody = namedContainerType(
  {
    ...phase0Ssz.BeaconBlockBody.fields,
    syncAggregate: SyncAggregate,
  },
  {typeName: "BeaconBlockBodyAltair", jsonCase: "eth2", cachePermanentRootStruct: true}
);

export const BeaconBlock = namedContainerType(
  {
    slot: Slot,
    proposerIndex: ValidatorIndex,
    parentRoot: Root,
    stateRoot: Root,
    body: BeaconBlockBody,
  },
  {typeName: "BeaconBlockAltair", jsonCase: "eth2", cachePermanentRootStruct: true}
);

export const SignedBeaconBlock = namedContainerType(
  {
    message: BeaconBlock,
    signature: BLSSignature,
  },
  {typeName: "SignedBeaconBlockAltair", jsonCase: "eth2"}
);

export const EpochParticipation = namedListBasicType(ParticipationFlags, VALIDATOR_REGISTRY_LIMIT);
export const InactivityScores = namedListBasicType(UintNum64, VALIDATOR_REGISTRY_LIMIT);

// we don't reuse phase0.BeaconState fields since we need to replace some keys
// and we cannot keep order doing that
export const BeaconState = namedContainerType(
  {
    genesisTime: GenesisTime,
    genesisValidatorsRoot: Root,
    slot: Slot,
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
    previousEpochParticipation: EpochParticipation,
    currentEpochParticipation: EpochParticipation,
    // Finality
    justificationBits: phase0Ssz.JustificationBits,
    previousJustifiedCheckpoint: phase0Ssz.Checkpoint,
    currentJustifiedCheckpoint: phase0Ssz.Checkpoint,
    finalizedCheckpoint: phase0Ssz.Checkpoint,
    // Inactivity
    inactivityScores: InactivityScores,
    // Sync
    currentSyncCommittee: SyncCommittee,
    nextSyncCommittee: SyncCommittee,
  },
  {typeName: "BeaconStateAltair", jsonCase: "eth2"}
);

export const LightClientBootstrap = namedContainerType(
  {
    header: phase0Ssz.BeaconBlockHeader,
    currentSyncCommittee: SyncCommittee,
    currentSyncCommitteeBranch: namedVectorCompositeType(Bytes32, NEXT_SYNC_COMMITTEE_DEPTH),
  },
  {typeName: "LightClientBootstrap", jsonCase: "eth2"}
);

export const LightClientUpdate = namedContainerType(
  {
    attestedHeader: phase0Ssz.BeaconBlockHeader,
    nextSyncCommittee: SyncCommittee,
    nextSyncCommitteeBranch: namedVectorCompositeType(Bytes32, NEXT_SYNC_COMMITTEE_DEPTH),
    finalizedHeader: phase0Ssz.BeaconBlockHeader,
    finalityBranch: namedVectorCompositeType(Bytes32, FINALIZED_ROOT_DEPTH),
    syncAggregate: SyncAggregate,
    signatureSlot: Slot,
  },
  {typeName: "LightClientUpdate", jsonCase: "eth2"}
);

export const LightClientFinalityUpdate = namedContainerType(
  {
    attestedHeader: phase0Ssz.BeaconBlockHeader,
    finalizedHeader: phase0Ssz.BeaconBlockHeader,
    finalityBranch: namedVectorCompositeType(Bytes32, FINALIZED_ROOT_DEPTH),
    syncAggregate: SyncAggregate,
    signatureSlot: Slot,
  },
  {typeName: "LightClientFinalityUpdate", jsonCase: "eth2"}
);

export const LightClientOptimisticUpdate = namedContainerType(
  {
    attestedHeader: phase0Ssz.BeaconBlockHeader,
    syncAggregate: SyncAggregate,
    signatureSlot: Slot,
  },
  {typeName: "LightClientOptimisticUpdate", jsonCase: "eth2"}
);

export const LightClientUpdatesByRange = namedContainerType(
  {
    startPeriod: UintNum64,
    count: UintNum64,
  },
  {typeName: "LightClientUpdatesByRange", jsonCase: "eth2"}
);

export const LightClientStore = namedContainerType(
  {
    snapshot: LightClientBootstrap,
    validUpdates: namedListCompositeType(LightClientUpdate, EPOCHS_PER_SYNC_COMMITTEE_PERIOD * SLOTS_PER_EPOCH),
  },
  {typeName: "LightClientStore", jsonCase: "eth2"}
);
