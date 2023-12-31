import {
  rename,
} from "node:fs"
import {
  readdir,
  stat,
} from "node:fs/promises"
import path, { join } from "node:path"
import {
  bindNodeCallback,
  catchError,
  filter,
  from,
  map,
  mergeAll,
  mergeMap,
  of,
  toArray,
  type Observable,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"

export type FolderInfo = {
  folderName: (
    string
  ),
  fullPath: (
    string
  ),
  renameFolder: (
    renamedFolderName: string,
  ) => (
    Observable<
      void
    >
  )
}

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
    mergeAll(),
    // filter((
    //   folderName,
    // ) => (
    //   folderName
    //   // -------------------------------------
    //   // UNCOMMENT THIS TIME TO TEST A SINGLE FILE
    //   // && folderName.startsWith('The Rock')
    //   // -------------------------------------
    // )),
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
      renameFolder: (
        renamedFolderName,
      ) => (
        of({
          oldFolderName: (
            join(
              sourcePath,
              folderName,
            )
          ),
          newFolderName: (
            join(
              sourcePath,
              renamedFolderName,
            )
            .concat(
              path
              .extname(
                folderName
              )
            )
          )
        })
        .pipe(
          filter(({
            newFolderName,
            oldFolderName,
          }) => (
            newFolderName
            !== oldFolderName
          )),
          mergeMap(({
            newFolderName,
            oldFolderName,
          }) => (
            from(
              stat(
                newFolderName,
              )
            )
            .pipe(
              catchError(() => (
                bindNodeCallback(
                  rename,
                )(
                  oldFolderName,
                  newFolderName,
                )
              )),
              map((
                stats,
              ) => {
                if (
                  stats
                ) {
                  throw (
                    "File already exists for "
                    .concat(
                      `"${renamedFolderName}"`
                    )
                  )
                }
              }),
            )
          )),
          catchNamedError(
            readFolder
          ),
        )
      )
    } satisfies (
      FolderInfo
    ) as (
      FolderInfo
    ))),
    mergeMap((
      folder,
    ) => (
      from(
        stat(
          folder
          .fullPath
        )
      )
      .pipe(
        filter((
          stats
        ) => (
          stats
          .isDirectory()
        )),
        map(() => (
          folder
        )),
      )
    )),
    toArray(),
    catchNamedError(
      readFolder
    ),
  )
)
