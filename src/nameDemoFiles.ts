import "@total-typescript/ts-reset"
import "dotenv/config"

import { writeFile } from "fs/promises"
import {
  concatAll,
  filter,
  ignoreElements,
  mergeAll,
  mergeMap,
  take,
  tap,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"
import { getArgValues } from "./getArgValues.js"
import { getMediaInfo } from "./getMediaInfo.js"
import { readFiles } from "./readFiles.js"

process
.on(
  "uncaughtException",
  (exception) => {
    console
    .error(
      exception
    )
  },
)

const {
  parentDirectory,
} = (
  getArgValues()
)

export const nameDemoFiles = () => (
  readFiles({
    parentDirectory,
  })
  .pipe(
    mergeAll(),
    take(1),
    mergeMap((
      file,
    ) => (
      getMediaInfo(
        file
        .fullPath
      )
    )),
    take(1),
    // toArray(),
    tap(t => {
      console.log(t)
    }),
    ignoreElements(),
    catchNamedError(
      nameDemoFiles
    )
  )
)

nameDemoFiles()
.subscribe()
