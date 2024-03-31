import {
  concatAll,
  filter,
  map,
  mergeAll,
  take,
  tap,
  toArray,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"
import { getIsVideoFile } from "./getIsVideoFile.js"
import { readFilesAtDepth } from "./readFilesAtDepth.js"
import { setOnlyFirstTracksAsDefault } from "./setOnlyFirstTracksAsDefault.js"

export const fixIncorrectDefaultTracks = ({
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
      setOnlyFirstTracksAsDefault({
        filePath: (
          fileInfo
          .fullPath
        )
      })
    )),
    concatAll(),
    toArray(),
    tap(() => {
      process
      .exit()
    }),
    catchNamedError(
      fixIncorrectDefaultTracks
    ),
  )
)
