import {ByteVectorType, UintNumberType, UintBigintType, BooleanType} from "@chainsafe/ssz";

export const Boolean = new BooleanType();
export const Byte = UintNumberType.named(1, {typeName: "Byte"});
export const Bytes4 = ByteVectorType.named(4, {typeName: "Bytes4"});
export const Bytes8 = ByteVectorType.named(8, {typeName: "Bytes8"});
export const Bytes20 = ByteVectorType.named(20, {typeName: "Bytes20"});
export const Bytes32 = ByteVectorType.named(32, {typeName: "Bytes32"});
export const Bytes48 = ByteVectorType.named(48, {typeName: "Bytes48"});
export const Bytes96 = ByteVectorType.named(96, {typeName: "Bytes96"});
export const Uint8 = UintNumberType.named(1, {typeName: "Uint8"});
export const Uint16 = UintNumberType.named(2, {typeName: "Uint16"});
export const Uint32 = UintNumberType.named(4, {typeName: "Uint32"});
export const UintNum64 = UintNumberType.named(8, {typeName: "UintNum64"});
export const UintNumInf64 = UintNumberType.named(8, {typeName: "UintNumInf64", clipInfinity: true});
export const UintBn64 = UintBigintType.named(8, {typeName: "UintBn64"});
export const UintBn128 = UintBigintType.named(16, {typeName: "UintBn128"});
export const UintBn256 = UintBigintType.named(32, {typeName: "UintBn256"});

// Custom types, defined for type hinting and readability

/** Same as @see Epoch + some validator properties must represent 2**52-1 also, which we map to `Infinity` */
function getEpochInf(typeName: string): UintNumberType {
  return UintNumberType.named(8, {typeName, clipInfinity: true});
}

/**
 * Use JS Number for performance, values must be limited to 2**52-1.
 * Slot is a time unit, so in all usages it's bounded by the clock, ensuring < 2**53-1
 */
export const Slot = UintNumberType.named(8, {typeName: "Slot"});
/**
 * Some objects do not verify time is bounded so must use bigint.
 * Since it's much slower we just use it for the minimum possible number of objects
 */
export const SlotBn = UintBigintType.named(8, {typeName: "SlotBn"});
/** Same as @see Slot */
export const Epoch = UintNumberType.named(8, {typeName: "Epoch"});
/** Same as @see Epoch + some validator properties must represent 2**52-1 also, which we map to `Infinity` */
export const EpochInf = getEpochInf("EpochInf");
/** Same as @see SlotBn */
export const EpochBn = UintBigintType.named(8, {typeName: "EpochBn"});
/**
 * Use JS Number for performance, values must be limited to 2**52-1.
 * SyncPeriod is a time unit, so in all usages it's bounded by the clock, ensuring < 2**53-1
 */
export const SyncPeriod = UintNumberType.named(8, {typeName: "SyncPeriod"});
/**
 * Use JS Number for performance, values must be limited to 2**52-1.
 * CommitteeIndex is bounded by the max possible number of committees which is bounded by `VALIDATOR_REGISTRY_LIMIT`
 */
export const CommitteeIndex = UintNumberType.named(8, {typeName: "CommitteeIndex"});
/** @see CommitteeIndex */
export const SubcommitteeIndex = UintNumberType.named(8, {typeName: "SubcommitteeIndex"});
/**
 * Use JS Number for performance, values must be limited to 2**52-1.
 * ValidatorIndex is bounded by `VALIDATOR_REGISTRY_LIMIT`
 */
export const ValidatorIndex = UintNumberType.named(8, {typeName: "ValidatorIndex"});
export const WithdrawalIndex = UintNumberType.named(8, {typeName: "WithdrawalIndex"});
// See reasoning on @see EpochInf. Have dedicated type name since the Validator object is very common
export const ActivationEligibilityEpoch = getEpochInf("ActivationEligibilityEpoch");
export const ActivationEpoch = getEpochInf("ActivationEpoch");
export const ExitEpoch = getEpochInf("ExitEpoch");
export const WithdrawableEpoch = getEpochInf("WithdrawableEpoch");
// Gwei is unbounded so must support full u64
export const Gwei = UintBigintType.named(8, {typeName: "Gwei"});
export const Root = ByteVectorType.named(32, {typeName: "Root"});
export const Version = ByteVectorType.named(4, {typeName: "Version"});
export const DomainType = ByteVectorType.named(4, {typeName: "DomainType"});
export const ForkDigest = ByteVectorType.named(4, {typeName: "ForkDigest"});
export const BLSPubkey = ByteVectorType.named(48, {typeName: "BLSPubkey"});
export const BLSSignature = ByteVectorType.named(96, {typeName: "BLSSignature"});
export const Domain = ByteVectorType.named(32, {typeName: "Domain"});
export const ParticipationFlags = UintNumberType.named(1, {typeName: "ParticipationFlags", setBitwiseOR: true});
export const ExecutionAddress = ByteVectorType.named(20, {typeName: "ExecutionAddress"});
export const WithdrawalCredentials = ByteVectorType.named(32, {typeName: "WithdrawalCredentials"});
export const BlockHash = ByteVectorType.named(32, {typeName: "BlockHash"});
export const Graffiti = ByteVectorType.named(32, {typeName: "Graffiti"});
export const Amount = UintNumberType.named(8, {typeName: "Amount"});
export const GenesisTime = UintNumberType.named(8, {typeName: "GenesisTime"});
export const DepositIndex = UintNumberType.named(8, {typeName: "DepositIndex"});
export const EffectiveBalance = UintNumberType.named(8, {typeName: "EffectiveBalance"});
