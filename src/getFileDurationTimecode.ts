import {
  EMPTY,
  from,
  map,
  mergeMap,
  of,
  take,
  type Observable,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"
import { type MediaInfo } from './getMediaInfo.js';

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

export const getFileDurationTimecode = ({
  filePath,
  mediaInfo,
}: {
  filePath: string,
  mediaInfo: MediaInfo,
}): (
  Observable<
    string
  >
) => (
  from(
    (
      mediaInfo
      ?.media
      ?.track
    )
    || []
  )
  .pipe(
    mergeMap((
      track
    ) => {
      if (
        (
          track
          ["@type"]
        )
        === "General"
      ) {
        return (
          of(track)
          .pipe(
            map(({
              Duration,
            }) => (
              convertDurationToTimecode(
                Number(
                  Duration
                )
              )
            )),
          )
        )
      }

      return EMPTY
    }),
    take(1),
    catchNamedError(
      getFileDurationTimecode
    ),
  )
)
