import {
  filter,
  from,
  map,
  mergeAll,
  mergeMap,
  take,
  type Observable,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"
import { getMediaInfo } from './getMediaInfo.js';
import { type FileInfo } from "./readFiles.js";

export const convertNumberToTimeString = (
  number: number,
): string => (
  String(
    number
  )
  .padStart(
    2,
    "0",
  )
)

export const convertDurationToTimecode = (
  durationInSeconds: number,
): string => {
  const date = (
    new Date(
      0,
      0,
      0,
      0,
      0,
      0,
    )
  )

  date
  .setSeconds(
    durationInSeconds
  )

  return (
    [
      (
        date
        .getHours()
      ),
      (
        date
        .getMinutes()
      ),
      (
        date
        .getSeconds()
      ),
    ]
    .filter((
      value,
      index,
    ) => (
      (
        index
        === 0
      )
      ? (
        Boolean(
          value
        )
      )
      : true
    ))
    .map((
      value,
      index,
    ) => (
      index > 0
      ? (
        convertNumberToTimeString(
          value
        )
      )
      : value
    ))
    .join(":")
  )
}

export const getFileVideoTimes = (
  files: FileInfo[],
): (
  Observable<{
    file: FileInfo,
    timecode: string,
  }>
) => (
  from(
    files
  )
  .pipe(
    mergeMap((
      file,
    ) => (
      getMediaInfo(
        file
        .fullPath
      )
      .pipe(
        map(({
          media,
        }) => (
          (
            media
            ?.track
          )
          || []
        )),
        mergeAll(),
        filter(({
          "@type": type,
        }) => (
          type === 'General'
        )),
        take(1),
        map(({
          Duration,
        }) => ({
          file,
          timecode: (
            convertDurationToTimecode(
              Number(
                Duration
              )
            )
          ),
        })),
      )
    )),
    catchNamedError(
      getFileVideoTimes
    ),
  )
)
