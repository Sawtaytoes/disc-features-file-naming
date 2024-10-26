import {
  concatAll,
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
import {
  convertDurationToTimecode,
  getFileDuration,
} from "./getFileDuration.js"
import { getMediaInfo } from "./getMediaInfo.js"
import { parseSpecialFeatures } from "./parseSpecialFeatures.js"
import { readFilesAtDepth } from "./readFilesAtDepth.js"
import { searchDvdCompare } from "./searchDvdCompare.js"

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
    concatMap((
      specialFeatureText,
    ) => (
      parseSpecialFeatures(
        specialFeatureText
      )
    )),
    concatMap((
      specialFeatures,
    ) => (
      readFilesAtDepth({
        depth: 0,
        sourcePath,
      })
      .pipe(
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
              getFileDuration({
                mediaInfo,
              })
            )),
            map((
              duration,
            ) => ({
              fileInfo,
              timecode: (
                convertDurationToTimecode(
                  duration
                )
              ),
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
