import {
  concatAll,
  concatMap,
  map,
  mergeAll,
  mergeMap,
  tap,
  toArray,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"
import { combineMediaWithData } from "./combineMediaWithData.js"
import { getArgValues } from "./getArgValues.js"
import { getFileDurationTimecode } from "./getFileDurationTimecode.js"
import { parseSpecialFeatures } from "./parseSpecialFeatures.js"
import { readFiles } from "./readFiles.js"
import { searchDvdCompare } from "./searchDvdCompare.js"
import { getMediaInfo } from "./getMediaInfo.js"

const {
  parentDirectory,
  url,
} = (
  getArgValues()
)

export const nameSpecialFeatures = () => (
  searchDvdCompare({
    url,
  })
  .pipe(
    mergeMap((
      specialFeatureText,
    ) => (
      parseSpecialFeatures(
        specialFeatureText
      )
    )),
    mergeMap((
      specialFeatures,
    ) => (
      readFiles({
        parentDirectory,
      })
      .pipe(
        mergeAll(),
        mergeMap((
          fileInfo,
        ) => (
          getMediaInfo(
            fileInfo
            .fullPath
          )
          .pipe(
            mergeMap((
              mediaInfo,
            ) => (
              getFileDurationTimecode({
                filePath: (
                  fileInfo
                  .fullPath
                ),
                mediaInfo,
              })
            )),
            concatMap((
              timecode,
            ) => (
              combineMediaWithData({
                filename: (
                  fileInfo
                  .filename
                ),
                specialFeatures,
                timecode,
              })
            )),
            // We don't want to rename any files just yet, so we're simply mapping to an observable.
            map((
              renamedFilename,
            ) => (
              fileInfo
              .renameFile(
                renamedFilename
              )
            )),
          )
        )),
      )
    )),

    // Wait till all renames are figured out before doing any renaming.
    toArray(),

    // Remove the array.
    concatAll(),

    // Rename everything by calling the mapped function.
    concatAll(),

    catchNamedError(
      nameSpecialFeatures
    )
  )
)

nameSpecialFeatures()
.subscribe()
