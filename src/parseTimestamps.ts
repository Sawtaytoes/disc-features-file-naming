/** Example Timestamp: "_00_01_31_799" */
export const parseMediaFileChapterTimestamp = (
  chapterTimestamp: string,
) => {
  const [
    hours,
    minutes,
    seconds,
    milliseconds,
  ] = (
    chapterTimestamp
    .split("_")
    .slice(1)
    .map((
      timeValue,
    ) => (
      Number(
        timeValue
        || ""
      )
    ))
  )

  return (
    hours * 60 * 60 * 1000
    + minutes * 60 * 1000
    + seconds * 1000
    + milliseconds
  )
}

/** Example Timestamp: "00:22:52.037000000" */
export const parseSubtitlesChapterTimestamp = (
  chapterTimestamp: string,
) => {
  const [
    timeCode,
    microseconds,
  ] = (
    chapterTimestamp
    .split(".")
  )

  const [
    hours,
    minutes,
    seconds,
  ] = (
    timeCode
    .split(":")
    .map((
      timeValue,
    ) => (
      Number(
        timeValue
        || ""
      )
    ))
  )

  const milliseconds = (
    Number(
      microseconds
    )
    / 1000
    / 1000
  )

  return (
    hours * 60 * 60 * 1000
    + minutes * 60 * 1000
    + seconds * 1000
    + milliseconds
  )
}
