import cliProgress from "cli-progress"
import colors from "ansi-colors"
import {
  spawn,
} from "node:child_process";
import {
  unlink,
} from "node:fs/promises"
import {
  map,
  Observable,
  tap,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"
import { Iso6392LanguageCode } from "./Iso6392LanguageCode.js"
import { getUserSearchInput } from "./getUserSearchInput.js";

export type Chapter = {
  num_entries: number
}

export type ContainerProperties = {
  container_type: number
  date_local: string
  date_utc: string
  duration: number
  is_providing_timestamps: boolean
  muxing_application: string
  segment_uid: string
  title: string
  writing_application: string
}

export type Container = {
  properties: ContainerProperties
  recognized: boolean
  supported: boolean
  type: string
}

export type TrackProperties = {
  codec_id: string
  codec_private_data?: string
  codec_private_length: number
  default_duration?: number
  default_track: boolean
  display_dimensions?: string
  display_unit?: number
  enabled_track: boolean
  forced_track: boolean
  language: string
  minimum_timestamp?: number
  num_index_entries: number
  number: number
  packetizer?: string
  pixel_dimensions?: string
  uid: number
  audio_channels?: number
  audio_sampling_frequency?: number
  track_name?: string
  audio_bits_per_sample?: number
}

export type Track = {
  codec: string
  id: number
  properties: TrackProperties
  type: string
}

export type MkvInfo = {
  attachments: any[]
  chapters: Chapter[]
  container: Container
  errors: any[]
  file_name: string
  global_tags: any[]
  identification_format_version: number
  track_tags: any[]
  tracks: Track[]
  warnings: any[]
}

const cliProgressBar = new cliProgress.SingleBar({
  format: 'Progress |' + colors.cyan('{bar}') + '| {percentage}%',
  barCompleteChar: '\u2588',
  barIncompleteChar: '\u2591',
  hideCursor: true,
});

const progressRegex = (
  /Progress: (\d+)%/
)

export const keepSpecifiedLanguageTracks = ({
  audioLanguage,
  filePath,
  subtitleLanguage,
}: {
  audioLanguage: Iso6392LanguageCode,
  filePath: string,
  subtitleLanguage: Iso6392LanguageCode,
}): (
  Observable<
    MkvInfo
  >
) => (
  new Observable<
    string
  >((
    observer,
  ) => {
    const newFilePath = (
      filePath
      .replace(
        /(\.mkv)/,
        " (LANGUAGE-TRIMMED)$1"
      )
    )

    const childProcess = (
      spawn(
        "mkvtoolnix-64-bit-78.0.7/mkvmerge.exe",
        [
          "--output",
          newFilePath,

          "--audio-tracks",
          audioLanguage,

          "--subtitle-tracks",
          subtitleLanguage,

          filePath,
        ],
        // (
        //   error,
        //   stdout,
        //   stderr,
        // ) => {
        //   if (error) {
        //     console.error(stderr) // TEMP
        //     observer
        //     .error(
        //       error
        //     )
        //   }

        //   console.log('stdout', stdout)
        //   observer
        //   .next({
        //     stderr,
        //     stdout,
        //   })
        // },
      )
    )

    let hasStarted = false

    childProcess
    .stdout
    .on(
      'data',
      (
        data
      ) => {
        if (
          data.toString().startsWith('Progress:')
        ) {
          if (
            !hasStarted
          ) {
            hasStarted = true

            cliProgressBar.start(
              100,
              Number(
                data
                .toString()
                .replace(
                  progressRegex,
                  "$1",
                )
              ),
              {},
            )
          }
          else {
            cliProgressBar
            .update(
              Number(
                data
                .toString()
                .replace(
                  progressRegex,
                  "$1",
                )
              )
            )
          }
        }
        else {
          console
          .info(
            data
            .toString()
          )
        }
      },
    )

    childProcess
    .stderr
    .on(
      'data',
      (
        error,
      ) => {
        console
        .error(
          error
          .toString()
        )

        observer
        .error(
          error
        )
      },
    )

    childProcess
    .on(
      'close',
      (
        code,
      ) => {
        unlink(
          newFilePath
        )
        .finally(() => {
          process
          .exit()
        })
      },
    )

    childProcess
    .on(
      'exit',
      (
        code,
      ) => {
        observer
        .complete()

        cliProgressBar
        .stop()

        process
        .stdin
        .setRawMode(
          false
        )
      },
    )

    process
    .stdin
    .setRawMode(
      true
    )

    process
    .stdin
    .resume()

    process
    .stdin
    .setEncoding(
      'utf8'
    )

    process.
    stdin
    .on(
      'data',
      (
        key,
      ) => {
        // [CTRL][C]
        if (
          (
            key
            .toString()
          )
          === "\u0003"
        ) {
          childProcess
          .kill()
        }

        process
        .stdout
        .write(
          key
        )
      }
    )

    // process
    // .on(
    //   'SIGINT',
    //   () => {
    //     console.log('YO!')

    //     console.log('deleted file')
    //     // .finally(() => {
    //     //   process.exit(0)
    //     // })
    //   },
    // )
  })
  // from(
  //   execFile(
  //     "mkvtoolnix-64-bit-78.0.7/mkvmerge.exe",
  //     [
  //       "--output",
  //       `${filePath} (LANGUAGE-TRIMMED)`,

  //       "--audio-tracks",
  //       audioLanguage,

  //       "--subtitle-tracks",
  //       subtitleLanguage,

  //       filePath,
  //     ],
  //   )
  // )
  .pipe(
    // map(({
    //   stderr,
    //   stdout,
    // }) => {
    //   if (
    //     stderr
    //   ) {
    //     throw stderr
    //   }

    //   return stdout
    // }),
    map((
      mkvInfoJsonString,
    ) => (
      JSON
      .parse(
        mkvInfoJsonString
      ) as (
        MkvInfo
      )
    )),
    catchNamedError(
      keepSpecifiedLanguageTracks
    ),
  )
)
