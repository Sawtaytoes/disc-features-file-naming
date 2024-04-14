import {
  filter,
  map,
  mergeAll,
  of,
  take,
  type Observable,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"
import {
  type GeneralTrack,
  type MediaInfo,
} from './getMediaInfo.js';

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

export const getFileDuration = ({
  mediaInfo,
}: {
  mediaInfo: MediaInfo,
}): (
  Observable<
    number
  >
) => (
  of(
    mediaInfo
  )
  .pipe(
    map(({
      media,
    }) => (
      media
      ?.track
    )),
    filter(
      Boolean
    ),
    mergeAll(),
    filter((
      track,
    ): track is GeneralTrack => (
      (
        track
        ["@type"]
      )
      === "General"
    )),
    take(1),
    map((
      generalTrack,
    ) => (
      Number(
        generalTrack
        .Duration
      )
    )),
    catchNamedError(
      getFileDuration
    ),
  )
)
