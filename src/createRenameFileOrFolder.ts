import { rename, stat } from "node:fs/promises"
import { basename, extname, join } from "node:path"
import {
  catchError,
  concatMap,
  filter,
  from,
  of,
  tap,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"
import { logInfo } from "./logMessage.js"

export const getFilenameFromFilePath = (
  filePath: string,
) => (
  basename(
    filePath,
    (
      extname(
        filePath
      )
    ),
  )
)

export const renameFileOrFolder = ({
  newPath,
  oldPath,
}: {
  newPath: string
  oldPath: string
}) => (
  from(
    stat(
      newPath,
    )
  )
  .pipe(
    // If the file or folder doesn't already exist, this function throws an error. We can safely perform the rename in that case..
    catchError(() => (
      rename(
        oldPath,
        newPath,
      )
    )),
    // If the `stat` succeeded, then we'll hit this `tap`. That means we can't rename the file because the one we're renaming to already exists.
    tap((
      stats,
    ) => {
      if (
        stats
      ) {
        throw (
          "File already exists for"
          .concat(
            " ",
            "\"",
            (
              getFilenameFromFilePath(
                newPath
              )
            ),
            "\".",
            " ",
            `Cannot rename ${oldPath}`
          )
        )
      }
    }),
  )
)

export const createRenameFileOrFolder = ({
  fullPath: oldPath,
  sourcePath,
}: {
  fullPath: string
  sourcePath: string
}) => (
  newName: string
) => (
  of({
    oldPath,
    newPath: (
      join(
        sourcePath,
        newName,
      )
      .concat(
        (
          extname(
            oldPath
          )
        ),
      )
    )
  })
  .pipe(
    filter(({
      newPath,
      oldPath,
    }) => (
      newPath
      !== oldPath
    )),
    // ignoreElements(), // UNCOMMENT TO PREVENT WRITING FILES
    concatMap(({
      newPath,
      oldPath,
    }) => (
      renameFileOrFolder({
        newPath,
        oldPath,
      })
      .pipe(
        tap(() => {
          logInfo(
            "RENAMED",
            oldPath,
            newPath,
          )
        }),
      )
    )),
    catchNamedError(
      createRenameFileOrFolder
    ),
  )
)
