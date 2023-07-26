import {
  execFile as execFileCallback,
} from 'node:child_process';
import {
  promisify,
} from 'node:util'
import {
  filter,
  from,
  map,
  mergeMap,
  tap,
  toArray,
  type Observable,
  mergeAll,
  take,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"
import { type File } from "./readFiles.js";
import { getMediaInfo } from './getMediaInfo.js';

const execFile = (
  promisify(
    execFileCallback
  )
)

export type Track = {
  '@type': string,
  'Duration': string,
}

export type MediaInfo = {
  media: (
    | {
      '@ref': string,
      track: Track[],
    }
    | null
  ),
}

export type Media = {
  file: File,
  timecode: string,
}

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
  files: File[],
): (
  Observable<
    Media
  >
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
