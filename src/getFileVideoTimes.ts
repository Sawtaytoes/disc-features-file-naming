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

import { catchNamedError } from "./catchNamedError"
import { type File } from './readFiles';

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
  duration: number,
): string => {
  const hours = (
    Math
    .floor(
      duration
      / 60
      / 60
    )
  )

  const minutes = (
    Math
    .floor(
      duration
      / 60
    )
  )

  const seconds = (
    Math
    .round(
      duration
      % 60
    )
  )

  if (
    hours
    > 0
  ) {
    return (
      String(
        hours
      )
      .concat(
        ":",
        (
          convertNumberToTimeString(
            minutes
          )
        ),
        ":",
        (
          convertNumberToTimeString(
            seconds
          )
        ),
      )
    )
  }

  return (
    String(
      minutes
    )
    .concat(
      ":",
      (
        convertNumberToTimeString(
          seconds
        )
      ),
    )
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
