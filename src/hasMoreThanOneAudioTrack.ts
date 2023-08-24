import {
  concatMap,
  count,
  EMPTY,
  filter,
  map,
  mergeAll,
  mergeMap,
  of,
  reduce,
  tap,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"
import { getArgValues } from "./getArgValues.js"
import {
  getMediaInfo,
  type AudioTrack,
} from "./getMediaInfo.js"
import { readFiles } from "./readFiles.js"
import { readFolders } from "./readFolders.js"

const {
  parentDirectory,
} = (
  getArgValues()
)

/** Useful for determining which demos have multiple audio tracks. */
export const hasMoreThanOneAudioTrack = () => (
  readFiles({
    parentDirectory,
  })
  .pipe(
    mergeAll(),
    mergeMap((
      fileInfo,
    ) => (
      getMediaInfo(
        fileInfo
        .fullPath
      )
      .pipe(
        filter(
          Boolean
        ),
        map(({
          media,
        }) => (
          media
        )),
        filter(
          Boolean
        ),
        concatMap(({
          track,
        }) => (
          track
        )),
        concatMap((
          track,
        ) => (
          (
            (
              track
              ["@type"]
            )
            === "Audio"
          )
          ? (
            of(
              track
            )
          )
          : EMPTY
        )),
        count(),
        filter((
          count,
        ) => (
          count
          > 1
        )),
        tap((
          count
        ) => {
          console
          .info(
            count,
            (
              fileInfo
              .fullPath
            ),
          )
        }),
      )
    )),
    catchNamedError(
      hasMoreThanOneAudioTrack
    ),
  )
)

hasMoreThanOneAudioTrack()
.subscribe()
