import {
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
import { readFolder } from "./readFolder.js"

const {
  parentDirectory,
} = (
  getArgValues()
)

export const hasImaxEnhancedAudio = () => (
  readFolder({
    sourcePath: parentDirectory,
  })
  .pipe(
    mergeAll(),
    mergeMap((
      folderInfo,
    ) => (
      readFiles({
        sourcePath: (
          folderInfo
          .fullPath
        )
      })
    )),
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
        mergeMap(({
          track,
        }) => (
          track
        )),
        mergeMap((
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
        filter(({
          "Format_AdditionalFeatures": formatAdditionalFeatures,
        }) => (
          formatAdditionalFeatures
          === "XLL X IMAX"
        )),
        tap(() => {
          console
          .info(
            fileInfo
            .filename
          )
        }),
      )
    )),
    catchNamedError(
      hasImaxEnhancedAudio
    ),
  )
)

hasImaxEnhancedAudio()
.subscribe()
