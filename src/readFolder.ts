import {
  readdir,
  stat,
} from "node:fs/promises"
import { join } from "node:path"
import {
  concatAll,
  concatMap,
  filter,
  from,
  map,
  toArray,
  type Observable,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"
import { createRenameFileOrFolder } from "./createRenameFileOrFolder.js"

export type FolderInfo = {
  folderName: (
    string
  ),
  fullPath: (
    string
  ),
  renameFolder: (
    newFolderName: string,
  ) => (
    Observable<
      void
    >
  )
}

export const getIsFolder = (
  folderPath: string
) => (
  from(
    stat(
      folderPath
    )
  )
  .pipe(
    filter((
      stats
    ) => (
      stats
      .isDirectory()
    )),
  )
)

export const readFolder = ({
  sourcePath,
}: {
  sourcePath: string,
}): (
  Observable<
    FolderInfo[]
  >
) => (
  from(
    readdir(
      sourcePath
    )
  )
  .pipe(
    concatAll(),
    map((
      folderName,
    ) => ({
      folderName,
      fullPath: (
        join(
          sourcePath,
          folderName,
        )
      ),
    })),
    concatMap(({
      folderName,
      fullPath,
    }) => (
      getIsFolder(
        fullPath
      )
      .pipe(
        map(() => ({
          folderName,
          fullPath,
          renameFolder: (
            createRenameFileOrFolder({
              fullPath,
              sourcePath,
            })
          ),
        } satisfies (
          FolderInfo
        ) as (
          FolderInfo
        ))),
      )
    )),
    toArray(),
    catchNamedError(
      readFolder
    ),
  )
)
