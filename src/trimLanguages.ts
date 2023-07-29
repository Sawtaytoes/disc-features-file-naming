import "@total-typescript/ts-reset"
import "dotenv/config"

import {
  filter,
  ignoreElements,
  mergeAll,
  mergeMap,
  take,
  tap,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"
import { getArgValues } from "./getArgValues.js"
import { keepSpecifiedLanguageTracks } from "./keepSpecifiedLanguageTracks.js"
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
