import {
  readdir,
  rename,
  stat,
} from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import {
  filter,
  from,
  map,
  mergeMap,
  tap,
} from "rxjs"

import { catchNamedError } from "./catchNamedError"

export type FilenameRename = {
  nextFilename: string,
  previousFilename: string,
}

export const renameFiles = ({
  filenameRenames,
}: {
  filenameRenames: FilenameRename[],
}) => (
  from(
    filenameRenames
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
      renameFiles
    ),
  )
)
