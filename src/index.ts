import "@total-typescript/ts-reset"
import "dotenv/config"

import {
  combineLatest,
  concatMap,
  ignoreElements,
  mergeMap,
  tap,
} from "rxjs"

import { catchNamedError } from "./catchNamedError"
import { combineMediaWithData } from "./combineMediaWithData"
import { getArgValues } from './getArgValues'
import { getFileVideoTimes } from "./getFileVideoTimes"
import { parseExtras } from "./parseExtras"
import { readFiles } from './readFiles'
import { renameFiles } from "./renameFiles"
import { searchDvdCompare } from "./searchDvdCompare"

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
  url,
} = (
  getArgValues()
)

searchDvdCompare({
  url,
})
.pipe(
  mergeMap((
    extrasText,
  ) => (
    parseExtras(
      extrasText
    )
  )),
  mergeMap((
    extras,
  ) => (
    readFiles({
      parentDirectory,
    })
    .pipe(
      mergeMap((
        files,
      ) => (
        getFileVideoTimes(
          files
        )
      )),
      concatMap((
        media,
      ) => (
        combineMediaWithData({
          extras,
          media,
        })
      )),
    )
  )),
  tap(console.log),
  ignoreElements(),
  mergeMap((
    filenameRenames,
  ) => (
    renameFiles(
      filenameRenames
    )
  )),
  catchNamedError(
    'index'
  )
)
.subscribe()
