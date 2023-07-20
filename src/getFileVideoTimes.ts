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
  media: {
    '@ref': string,
    track: Track[],
  },
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
      from(
        execFile(
          'MediaInfo_CLI_23.07_Windows_x64/MediaInfo.exe',
          [
            '--Output=JSON',
            (
              file
              .fullPath
            ),
          ],
        )
      )
      .pipe(
        map(({
          stderr,
          stdout,
        }) => {
          if (stderr) {
            throw stderr
          }

          return stdout
        }),
        map((
          mediaInfoJsonString,
        ) => (
          JSON
          .parse(
            mediaInfoJsonString
          ) as (
            MediaInfo
          )
        )),
        map(({
          media,
        }) => (
          media
          .track
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
