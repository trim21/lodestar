import {ValueOf} from "@chainsafe/ssz";
import * as ssz from "./sszTypes.js";

// Each type exported here contains both a compile-time type
// (a typescript interface) and a run-time ssz type (a javascript variable)
// For more information, see ./index.ts

/** Common non-spec type to represent roots as strings */
export type RootHex = string;
/** Non-spec type to signal time is represented in seconds */
export type TimeSeconds = number;

export type Bytes4 = ValueOf<typeof ssz.Bytes4>;
export type Bytes8 = ValueOf<typeof ssz.Bytes8>;
export type Bytes20 = ValueOf<typeof ssz.Bytes20>;
export type Bytes32 = ValueOf<typeof ssz.Bytes32>;
export type Bytes48 = ValueOf<typeof ssz.Bytes48>;
export type Bytes96 = ValueOf<typeof ssz.Bytes96>;
export type Uint8 = ValueOf<typeof ssz.Uint8>;
export type Uint16 = ValueOf<typeof ssz.Uint16>;
export type Uint32 = ValueOf<typeof ssz.Uint32>;
export type UintNum64 = ValueOf<typeof ssz.UintNum64>;
export type UintNumInf64 = ValueOf<typeof ssz.UintNumInf64>;
export type UintBn64 = ValueOf<typeof ssz.UintBn64>;
export type UintBn128 = ValueOf<typeof ssz.UintBn128>;
export type UintBn256 = ValueOf<typeof ssz.UintBn256>;

// Custom types, defined for type hinting and readability

export type Slot = ValueOf<typeof ssz.Slot>;
export type SlotBn = ValueOf<typeof ssz.SlotBn>;
export type Epoch = ValueOf<typeof ssz.Epoch>;
export type EpochInf = ValueOf<typeof ssz.EpochInf>;
export type EpochBn = ValueOf<typeof ssz.EpochBn>;
export type SyncPeriod = ValueOf<typeof ssz.SyncPeriod>;
export type CommitteeIndex = ValueOf<typeof ssz.CommitteeIndex>;
export type SubcommitteeIndex = ValueOf<typeof ssz.SubcommitteeIndex>;
export type ValidatorIndex = ValueOf<typeof ssz.ValidatorIndex>;
export type WithdrawalIndex = ValueOf<typeof ssz.WithdrawalIndex>;
export type ActivationEligibilityEpoch = ValueOf<typeof ssz.ActivationEligibilityEpoch>;
export type ActivationEpoch = ValueOf<typeof ssz.ActivationEpoch>;
export type ExitEpoch = ValueOf<typeof ssz.ExitEpoch>;
export type WithdrawableEpoch = ValueOf<typeof ssz.WithdrawableEpoch>;
export type Gwei = ValueOf<typeof ssz.Gwei>;
export type Root = ValueOf<typeof ssz.Root>;
export type Version = ValueOf<typeof ssz.Version>;
export type DomainType = ValueOf<typeof ssz.DomainType>;
export type ForkDigest = ValueOf<typeof ssz.ForkDigest>;
export type BLSPubkey = ValueOf<typeof ssz.BLSPubkey>;
export type BLSSignature = ValueOf<typeof ssz.BLSSignature>;
export type Domain = ValueOf<typeof ssz.Domain>;
export type ParticipationFlags = ValueOf<typeof ssz.ParticipationFlags>;
export type ExecutionAddress = ValueOf<typeof ssz.ExecutionAddress>;
export type WithdrawalCredentials = ValueOf<typeof ssz.WithdrawalCredentials>;
export type BlockHash = ValueOf<typeof ssz.BlockHash>;
export type Graffiti = ValueOf<typeof ssz.Graffiti>;
export type Amount = ValueOf<typeof ssz.Amount>;
export type GenesisTime = ValueOf<typeof ssz.GenesisTime>;
export type DepositIndex = ValueOf<typeof ssz.DepositIndex>;
export type EffectiveBalance = ValueOf<typeof ssz.EffectiveBalance>;
