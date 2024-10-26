import {
  concatAll,
  map,
  tap,
  toArray,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"
import { filterIsVideoFile } from "./filterIsVideoFile.js"
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
    concatAll(),
    filterIsVideoFile(),
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
