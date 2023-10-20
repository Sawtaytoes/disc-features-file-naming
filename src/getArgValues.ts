export const getArgValues = () => {
  // const scriptName = (
  //   process
  //   .argv
  //   .at(2)
  // )

  const parentDirectory = (
    process
    .argv
    .at(2)
  )

  if (!parentDirectory) {
    throw new Error('You need to enter a parent directory.')
  }

  const sourceDirectory = (
    (
      process
      .argv
      .at(2)
    )
    || ""
  )

  const destinationDirectory = (
    (
      process
      .argv
      .at(3)
    )
    || ""
  )

  const globalOffsetInMilliseconds: (
    | "automatic"
    | number
  ) = (
    (
      (
        process
        .argv
        .at(4)
      )
      === "automatic"
    )
    ? "automatic"
    : (
      Number(
        (
          process
          .argv
          .at(4)
        )
        || 0
      )
    )
  )

  const url = (
    (
      process
      .argv
      .at(3)
    )
    || ""
  )

  const seasonNumber = (
    process
    .argv
    .at(3)
  )

  const searchString = (
    process
    .argv
    .at(4)
  )

  return {
    destinationDirectory,
    globalOffsetInMilliseconds,
    parentDirectory,
    // scriptName,
    searchString,
    seasonNumber,
    sourceDirectory,
    url,
  }
}
