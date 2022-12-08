import {
  BasicType,
  CompositeType,
  CompositeView,
  CompositeViewDU,
  ContainerType,
  ContainerNodeStructType,
  ListBasicType,
  ListCompositeType,
  Type,
  VectorBasicType,
  VectorCompositeType,
} from "@chainsafe/ssz";

export type FAny = Record<string, Type<unknown>>;
export type CTypeAny<T extends CompositeType<unknown, unknown, unknown>> = CompositeType<
  unknown,
  CompositeView<T>,
  CompositeViewDU<T>
>;
export type BTAny = BasicType<unknown>;

export function namedContainerType<Fields extends FAny>(
  fields: Fields,
  opts: ConstructorParameters<typeof ContainerType>[1]
): ContainerType<Fields> {
  if (!opts?.typeName) {
    throw Error("opts?.typeName must be defined");
  }

  const NamedContainerType = new Function("superClass", `return class ${opts?.typeName}Type extends superClass {}`)(
    ContainerType
  ) as typeof ContainerType;

  return (new NamedContainerType(fields, opts) as unknown) as ContainerType<Fields>;
}

export function namedContainerNodeStructType<Fields extends FAny>(
  fields: Fields,
  opts: ConstructorParameters<typeof ContainerNodeStructType>[1]
): ContainerNodeStructType<Fields> {
  if (!opts?.typeName) {
    throw Error("opts?.typeName must be defined");
  }

  const NamedContainerNodeStructType = new Function(
    "superClass",
    `return class ${opts?.typeName}Type extends superClass {}`
  )(ContainerNodeStructType) as typeof ContainerNodeStructType;

  return (new NamedContainerNodeStructType(fields, opts) as unknown) as ContainerNodeStructType<Fields>;
}

export function namedListBasicType<ElementType extends BasicType<unknown>>(
  elementType: ElementType,
  limit: number,
  opts: ConstructorParameters<typeof ListBasicType>[2]
): ListBasicType<ElementType> {
  if (!opts?.typeName) {
    throw Error("opts?.typeName must be defined");
  }

  const NamedListBasicType = new Function("superClass", `return class ${opts?.typeName}Type extends superClass {}`)(
    ListBasicType
  ) as typeof ListBasicType;

  return (new NamedListBasicType(elementType, limit, opts) as unknown) as ListBasicType<ElementType>;
}

export function namedListCompositeType<
  ElementType extends CompositeType<unknown, CompositeView<ElementType>, CompositeViewDU<ElementType>>
>(
  elementType: ElementType,
  limit: number,
  opts: ConstructorParameters<typeof ListCompositeType>[2]
): ListCompositeType<ElementType> {
  if (!opts?.typeName) {
    throw Error("opts?.typeName must be defined");
  }

  const NamedListCompositeType = new Function("superClass", `return class ${opts?.typeName}Type extends superClass {}`)(
    ListCompositeType
  ) as typeof ListCompositeType;

  return (new NamedListCompositeType(elementType, limit, opts) as unknown) as ListCompositeType<ElementType>;
}

export function namedVectorBasicType<ElementType extends BasicType<unknown>>(
  elementType: ElementType,
  length: number,
  opts: ConstructorParameters<typeof VectorBasicType>[2]
): VectorBasicType<ElementType> {
  if (!opts?.typeName) {
    throw Error("opts?.typeName must be defined");
  }

  const NamedVectorBasicType = new Function("superClass", `return class ${opts?.typeName}Type extends superClass {}`)(
    VectorBasicType
  ) as typeof VectorBasicType;

  return (new NamedVectorBasicType(elementType, length, opts) as unknown) as VectorBasicType<ElementType>;
}

export function namedVectorCompositeType<
  ElementType extends CompositeType<unknown, CompositeView<ElementType>, CompositeViewDU<ElementType>>
>(
  elementType: ElementType,
  length: number,
  opts: ConstructorParameters<typeof VectorCompositeType>[2]
): VectorCompositeType<ElementType> {
  if (!opts?.typeName) {
    throw Error("opts?.typeName must be defined");
  }

  const NamedVectorCompositeType = new Function(
    "superClass",
    `return class ${opts?.typeName}Type extends superClass {}`
  )(VectorCompositeType) as typeof VectorCompositeType;

  return (new NamedVectorCompositeType(elementType, length, opts) as unknown) as VectorCompositeType<ElementType>;
}
