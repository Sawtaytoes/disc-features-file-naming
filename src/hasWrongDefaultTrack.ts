import colors from "ansi-colors"
import {
  concatAll,
  concatMap,
  filter,
  from,
  groupBy,
  map,
  mergeAll,
  mergeMap,
  take,
  tap,
  toArray,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"
import { getIsVideoFile } from "./getIsVideoFile.js"
import { getMkvInfo } from "./getMkvInfo.js"
import { readFilesAtDepth } from "./readFilesAtDepth.js"

export const hasWrongDefaultTrack = ({
  isRecursive,
  sourcePath,
}: {
  isRecursive: boolean
  sourcePath: string
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
            groupBy((
              track,
            ) => (
              track
              .type
            )),
            mergeMap((
              group$,
            ) => (
              group$
              .pipe(
                toArray(),
                filter((
                  groupedTracks,
                ) => (
                  (
                    groupedTracks
                    .length
                  )
                  > 1
                )),
                concatAll(),
                take(1),
                filter(({
                  properties,
                }) => (
                  !(
                    properties
                    .default_track
                  )
                )),
              )
            )),
            toArray(),
            tap((
              trackGroups,
            ) => {
              console
              .info(
                (
                  fileInfo
                  .fullPath
                ),
                "\n",
                (
                  colors
                  .bold
                  .cyan(
                    "Wrong Default Track:"
                  )
                ),
                (
                  trackGroups
                  .map(({
                    type,
                  }) => (
                    type
                  ))
                  .join(", ")
                ),
                "\n",
              )
            }),
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
      hasWrongDefaultTrack
    ),
  )
)
