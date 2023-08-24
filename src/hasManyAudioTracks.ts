import {
  concatMap,
  count,
  EMPTY,
  filter,
  map,
  mergeAll,
  mergeMap,
  of,
  tap,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"
import { getArgValues } from "./getArgValues.js"
import { getMediaInfo } from "./getMediaInfo.js"
import { readFiles } from "./readFiles.js"

const {
  parentDirectory,
} = (
  getArgValues()
)

/** Useful for determining which demos have probably too many audio tracks. */
export const hasManyAudioTracks = () => (
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
          > 2
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
      hasManyAudioTracks
    ),
  )
)

hasManyAudioTracks()
.subscribe()
