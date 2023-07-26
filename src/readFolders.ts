import {
  rename,
} from "node:fs"
import {
  readdir,
  stat,
} from "node:fs/promises"
import path from "node:path"
import {
  bindNodeCallback,
  filter,
  from,
  map,
  mergeAll,
  mergeMap,
  toArray,
  type Observable,
  of,
  catchError,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"

export type FileFolder = {
  foldername: (
    string
  ),
  fullPath: (
    string
  ),
  renameFolder: (
    renamedFoldername: string,
  ) => (
    Observable<
      void
    >
  )
}

export const readFolders = ({
  parentDirectory,
}: {
  parentDirectory: string,
}): (
  Observable<
    FileFolder[]
  >
) => (
  from(
    readdir(
      parentDirectory
    )
  )
  .pipe(
    mergeAll(),
    // filter((
    //   foldername,
    // ) => (
    //   foldername
    //   // -------------------------------------
    //   // UNCOMMENT THIS TIME TO TEST A SINGLE FILE
    //   // && foldername.startsWith('The Rock')
    //   // -------------------------------------
    // )),
    map((
      foldername,
    ) => ({
      foldername,
      fullPath: (
        parentDirectory
        .concat(
          path.sep,
          foldername,
        )
      ),
      renameFolder: (
        renamedFoldername,
      ) => (
        of({
          oldFoldername: (
            parentDirectory
            .concat(
              path.sep,
              foldername,
            )
          ),
          newFoldername: (
            parentDirectory
            .concat(
              path.sep,
              renamedFoldername,
              (
                path
                .extname(
                  foldername
                )
              ),
            )
          )
        })
        .pipe(
          filter(({
            newFoldername,
            oldFoldername,
          }) => (
            newFoldername
            !== oldFoldername
          )),
          mergeMap(({
            newFoldername,
            oldFoldername,
          }) => (
            from(
              stat(
                newFoldername,
              )
            )
            .pipe(
              catchError(() => (
                bindNodeCallback(
                  rename,
                )(
                  oldFoldername,
                  newFoldername,
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
                      `"${renamedFoldername}"`
                    )
                  )
                }
              }),
            )
          )),
          catchNamedError(
            readFolders
          ),
        )
      )
    } satisfies (
      FileFolder
    ) as (
      FileFolder
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
      readFolders
    ),
  )
)
