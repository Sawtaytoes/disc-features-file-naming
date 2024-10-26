import {
  concat,
  concatAll,
  concatMap,
  EMPTY,
  iif,
  merge,
  mergeAll,
  mergeMap,
} from "rxjs"

import { readFiles } from "./readFiles.js"
import { readFolder } from "./readFolder.js"

export const readFilesAtDepth = ({
  depth,
  sourcePath,
}: {
  depth: number,
  sourcePath: string
}): ReturnType<typeof readFiles> => (
  concat(
    (
      readFiles({
        sourcePath,
      })
    ),
    (
      iif(
        () => (
          depth
          > 0
        ),
        (
          readFolder({
            sourcePath,
          })
          .pipe(
            concatAll(),
            concatMap((
              folderInfo,
            ) => (
              readFilesAtDepth({
                depth: (depth - 1),
                sourcePath: (
                  folderInfo
                  .fullPath
                ),
              })
            )),
          )
        ),
        EMPTY,
      )
    ),
  )
)
