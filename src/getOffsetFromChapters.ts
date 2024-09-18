import {
  EMPTY,
  combineLatest,
  concatAll,
  concatMap,
  filter,
  from,
  map,
  of,
  take,
  toArray,
  zip,
} from "rxjs"

import { getMediaInfo } from "./getMediaInfo.js"
import { parseMediaFileChapterTimestamp } from "./parseTimestamps.js"

export const getOffsetFromChapters = () => (
  combineLatest([
    (
      getMediaInfo(
        mediaFilePath
      )
    ),
    (
      getMediaInfo(
        destinationFilePath
      )
    ),
  ])
  .pipe(
    concatAll(),
    map((
      mediaInfo,
    ) => (
      mediaInfo
      ?.media
      ?.track
      .flatMap((
        track,
      ) => (
        (
          track
          ["@type"]
        )
        === "Menu"
      )
      ? track
      : []
      )
      .find(
        Boolean
      )
      ?.extra
    )),
    filter(
      Boolean
    ),
    map((
      chapters,
    ) => (
      Object
      .keys(
        chapters
      )
      .map((
        chapterTimestamp,
      ) => (
        parseMediaFileChapterTimestamp(
          chapterTimestamp
        )
      ))
    )),
    toArray(),
    concatMap(([
      sourceFileChapterTimestamps,
      destinationFileChapterTimestamps,
    ]) => (
      zip([
        from(
          sourceFileChapterTimestamps,
        ),
        from(
          destinationFileChapterTimestamps
        ),
      ])
    )),
    concatMap(([
      sourceFileChapterTimestamp,
      destinationFileChapterTimestamp,
    ]) => {
      const offsetInMilliseconds = (
        destinationFileChapterTimestamp
        - sourceFileChapterTimestamp
      )

      return (
        (
          offsetInMilliseconds
          === 0
        )
        ? EMPTY
        : (
          of(
            offsetInMilliseconds
          )
        )
      )
    }),
    take(1),
  )
)
