import { rename } from "node:fs/promises"
import os from "node:os"
import {
  filter,
  from,
  map,
  mergeMap,
  of,
  tap,
} from "rxjs"

import { catchNamedError } from "./catchNamedError"

export type FilenameRename = {
  nextFilename: string,
  previousFilename: string,
}

export const renameFile = (
  renameFile: File["renameFile"],
) => (
  from(
    renameFile
  )
  .pipe(
    filter(({
      nextFilename,
      previousFilename,
    }) => (
      nextFilename
      !== previousFilename
    )),
    tap(({
      nextFilename,
      previousFilename,
    }) => {
      console
      .info(
        previousFilename,
        "\n",
        nextFilename,
        "\n",
        "\n",
      )
    }),
    // -------------------------------------
    // UNCOMMENT THIS TO SAFELY DEBUG CHANGES
    // -------------------------------------
    // ignoreElements(),
    // -------------------------------------
    map(({
      nextFilename,
      previousFilename,
    }) => (
      () => (
        rename(
          previousFilename,
          nextFilename,
        ))
      )
    ),
    mergeMap(
      (
        func
      ) => (
        func()
      ),
      (
        os
        .cpus()
        .length
      ),
    ),
    catchNamedError(
      renameFile
    ),
  )
)
