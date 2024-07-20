import {
  EMPTY,
  merge,
  mergeAll,
  mergeMap,
  tap,
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
  depth > 0
  ? (
    readFolder({
      sourcePath,
    })
    .pipe(
      mergeAll(),
      mergeMap((
        folderInfo,
      ) => (
        merge(
          (
            readFiles({
              sourcePath: (
                folderInfo
                .fullPath
              )
            })
          ),
          (
            (depth - 1) > 0
            ? (
              readFilesAtDepth({
                depth: (depth - 1),
                sourcePath: (
                  folderInfo
                  .fullPath
                ),
              })
            )
            : EMPTY
          ),
        )
      )),
    )
  )
  : (
    readFiles({
      sourcePath,
    })
  )
)
