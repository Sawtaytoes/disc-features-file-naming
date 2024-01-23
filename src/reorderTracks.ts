import {
  concatAll,
  concatMap,
  filter,
  from,
  map,
  mergeAll,
  tap,
  toArray,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"
import { getIsVideoFile } from "./getIsVideoFile.js"
import { getMkvInfo } from "./getMkvInfo.js"
import { readFilesAtDepth } from "./readFilesAtDepth.js"

export type TrackAlias = (
  | "a"
  | "s"
  | "v"
)

export type TrackReorder = {
  originalTrackIndex: number
  swappedTrackIndex: number
  trackType: (
    | "audio"
    | "subtitles"
    | "video"
  )
}

export const reorderTracks = ({
  isRecursive,
  sourcePath,
  trackReorders,
}: {
  isRecursive: boolean
  sourcePath: string
  trackReorders: TrackReorder[]
}) => (
  readFilesAtDepth({
    depth: (
      isRecursive
      ? 1
      : 0
    ),
    sourcePath,
  })
  .pipe(
    mergeAll(),
    filter((
      fileInfo
    ) => (
      getIsVideoFile(
        fileInfo
        .fullPath
      )
    )),
    map((
      fileInfo,
    ) => (
      getMkvInfo(
        fileInfo
        .fullPath
      )
      .pipe(
        concatMap(({
          tracks
        }) => (
          from(
            tracks
          )
          .pipe(
            tap((track) => {
              console.log(track.properties.number)
            }),
            filter((
              track,
            ) => (
              Boolean(
                track
                .properties
                .number
              )
            )),
            // concatMap((
            //   track,
            // ) => (
            //   updateTrackLanguage({
            //     filePath: (
            //       fileInfo
            //       .fullPath
            //     ),
            //     languageCode: (
            //       trackTypeLanguageCode
            //       [
            //         track
            //         .type
            //       ]!
            //     ),
            //     trackId: (
            //       track
            //       .properties
            //       .number
            //     ),
            //   })
            // )),
          )
        )),
      )
    )),
    concatAll(),
    toArray(),
    tap(() => {
      process
      .exit()
    }),
    catchNamedError(
      reorderTracks
    ),
  )
)
