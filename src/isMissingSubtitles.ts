import {
  cpus,
} from "node:os"
import {
  concatMap,
  filter,
  map,
  mergeAll,
  reduce,
  tap,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"
import { getIsVideoFile } from "./getIsVideoFile.js"
import {
  getMediaInfo,
  type TextTrack,
} from "./getMediaInfo.js"
import { readFilesAtDepth } from "./readFilesAtDepth.js"

export const isMissingSubtitles = ({
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
        filter((
          track,
        ): track is TextTrack => (
          (
            track
            ["@type"]
          )
          === "Text"
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
    mergeAll(
      cpus()
      .length
    ),
    catchNamedError(
      isMissingSubtitles
    ),
  )
)
