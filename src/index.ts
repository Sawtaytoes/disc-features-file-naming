import "@total-typescript/ts-reset"
import "dotenv/config"

import {
  concatAll,
  concatMap,
  ignoreElements,
  mergeAll,
  mergeMap,
  tap,
  toArray,
} from "rxjs"

import { catchNamedError } from "./catchNamedError"
import { combineMediaWithData } from "./combineMediaWithData"
import { getArgValues } from './getArgValues'
import { getFileVideoTimes } from "./getFileVideoTimes"
import { parseExtras } from "./parseExtras"
import { readFiles } from './readFiles'
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
  toArray(),
  // ignoreElements(),
  mergeAll(),
  concatAll(),
  catchNamedError(
    'index'
  )
)
.subscribe()
