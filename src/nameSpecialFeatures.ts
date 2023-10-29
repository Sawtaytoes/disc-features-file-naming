import {
  concatMap,
  map,
  mergeAll,
  mergeMap,
  Observable,
  scan,
  toArray,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"
import { combineMediaWithData } from "./combineMediaWithData.js"
import { getFileDurationTimecode } from "./getFileDurationTimecode.js"
import { parseSpecialFeatures } from "./parseSpecialFeatures.js"
import { readFiles } from "./readFiles.js"
import { searchDvdCompare } from "./searchDvdCompare.js"
import { getMediaInfo } from "./getMediaInfo.js"

const getNextFilenameCount = (
  previousCount?: number,
) => (
  (
    previousCount
    || 0
  )
  + 1
)

export const nameSpecialFeatures = ({
  sourcePath,
  url,
}: {
  sourcePath: string,
  url: string,
}) => (
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
        sourcePath,
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
            map((
              timecode,
            ) => ({
              fileInfo,
              timecode,
            })),
          )
        )),
        concatMap(({
          fileInfo,
          timecode,
        }) => (
          combineMediaWithData({
            filename: (
              fileInfo
              .filename
            ),
            specialFeatures,
            timecode,
          })
          .pipe(
            map((
              renamedFilename,
            ) => ({
              fileInfo,
              renamedFilename,
            }))
          )
        )),
        scan(
          (
            {
              previousFilenameCount,
            },
            {
              fileInfo,
              renamedFilename,
            },
          ) => ({
            previousFilenameCount: {
              ...previousFilenameCount,
              [renamedFilename]: (
                getNextFilenameCount(
                  previousFilenameCount
                  [renamedFilename]
                )
              )
            },
            renameFile$: (
              fileInfo
              .renameFile(
                (
                  renamedFilename in (
                    previousFilenameCount
                  )
                )
                ? (
                  "("
                  .concat(
                    (
                      String(
                        getNextFilenameCount(
                          previousFilenameCount
                          [renamedFilename]
                        )
                      )
                    ),
                    ") ",
                    renamedFilename
                  )
                )
                : renamedFilename
              )
            ),
          }),
          {
            previousFilenameCount: {} as (
              Record<
                string,
                number
              >
            ),
            renameFile$: (
              new Observable()
            ) as (
              Observable<
                void
              >
            ),
          },
        ),
        map(({
          renameFile$
        }) => (
          renameFile$
        )),
      )
    )),

    // Wait till all renames are figured out before doing any renaming.
    toArray(),

    // Unfold the array.
    mergeAll(),

    // Rename everything by calling the mapped function.
    mergeAll(),

    catchNamedError(
      nameSpecialFeatures
    )
  )
)
