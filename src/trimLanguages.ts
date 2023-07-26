import "@total-typescript/ts-reset"
import "dotenv/config"

import {
  concatAll,
  concatMap,
  filter,
  ignoreElements,
  mergeAll,
  mergeMap,
  reduce,
  take,
  tap,
  toArray,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"
import { combineMediaWithData } from "./combineMediaWithData.js"
import { getArgValues } from "./getArgValues.js"
import { getFileVideoTimes } from "./getFileVideoTimes.js"
import { parseExtras } from "./parseExtras.js"
import { readFiles } from "./readFiles.js"
import { searchDvdCompare } from "./searchDvdCompare.js"
import { getMkvInfo } from "./getMkvInfo.js"
import { keepSpecifiedLanguageTracks } from "./keepSpecifiedLanguageTracks.js"

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

export const trimLanguages = () => (
  readFiles({
    parentDirectory,
  })
  .pipe(
    mergeAll(),
    take(1),
    mergeMap((
      file,
    ) => (
      keepSpecifiedLanguageTracks({
        audioLanguage: "eng",
        filePath: (
          file
          .fullPath
        ),
        subtitleLanguage: "eng",
      })
    )),
    mergeMap((
      mkvInfo,
    ) => (
      mkvInfo
      .tracks
    )),
    filter(({
      properties,
    }) => (
      (
        properties
        .language
      )
      === "eng"
    )),
    // toArray(),
    tap(t => { console.log(t) }),
    ignoreElements(),
    catchNamedError(
      trimLanguages
    )
  )
)

trimLanguages()
.subscribe()
