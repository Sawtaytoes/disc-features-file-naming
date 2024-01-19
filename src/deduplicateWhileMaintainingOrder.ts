export const deduplicateWhileMaintainingOrder = <
  ValueType
>(
  array: ValueType[]
) => (
  array
  .reduce(
    (
      deduplicatedArray,
      value,
    ) => (
      deduplicatedArray
      .includes(
        value
      )
      ? deduplicatedArray
      : (
        deduplicatedArray
        .concat(
          value
        )
      )
    ),
    [] as (
      unknown
    ) as (
      ValueType[]
    ),
  )
)
