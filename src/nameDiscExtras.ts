import {
  concatAll,
  concatMap,
  mergeMap,
  toArray,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"
import { combineMediaWithData } from "./combineMediaWithData.js"
import { getArgValues } from "./getArgValues.js"
import { getFileVideoTimes } from "./getFileVideoTimes.js"
import { parseExtras } from "./parseExtras.js"
import { readFiles } from "./readFiles.js"
import { searchDvdCompare } from "./searchDvdCompare.js"

const {
  parentDirectory,
  url,
} = (
  getArgValues()
)

export const nameDiscExtras = () => (
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
    concatAll(),
    concatAll(),
    catchNamedError(
      nameDiscExtras
    )
  )
)
