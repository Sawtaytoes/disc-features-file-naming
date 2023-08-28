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
    parentDirectory,
    // scriptName,
    searchString,
    seasonNumber,
    url,
  }
}
