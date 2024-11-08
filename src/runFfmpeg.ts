import colors from "ansi-colors"
import cliProgress from "cli-progress"
import {
  spawn,
} from "node:child_process";
import {
  unlink,
} from "node:fs/promises"
import { extname } from "node:path";
import {
  concatMap,
  from,
  mergeMap,
  reduce,
  Observable,
} from "rxjs"

import { ffmpegPath as defaultFfmpegPath } from "./appPaths.js";
import { catchNamedError } from "./catchNamedError.js"
import { getFileDuration } from "./getFileDuration.js";
import { getMediaInfo } from "./getMediaInfo.js";
import { convertTimecodeToMilliseconds } from "./parseTimestamps.js";
import { logWarning } from "./logMessage.js";

const cliProgressBar = (
  new cliProgress
  .SingleBar({
    format: (
      "Progress |"
      .concat(
        (
          colors
          .cyan(
            "{bar}"
          )
        ),
        "| {percentage}%",
      )
    ),
    barCompleteChar: "\u2588",
    barIncompleteChar: "\u2591",
    hideCursor: true,
  })
)

// frame=  478 fps= 52 q=16.0 size=   38656kB time=00:00:19.93 bitrate=15883.9kbits/s speed=2.18x
const progressRegex = (
  /.*time=(.+) bitrate=.*\r?/
)

export type ExtensionMimeType = (
  | ".otf"
  | ".ttf"
)

export const extensionMimeType: (
  Record<
    ExtensionMimeType,
    string
  >
) = {
  ".otf": "mimetype=application/x-opentype-font",
  ".ttf": "mimetype=application/x-truetype-font",
}

export const convertNaNToTimecode = (
  timecode: string,
) => (
  (
    (
      timecode
      .replace(
        /\d{2}:\d{2}:\d{2}\.\d+/,
        "",
      )
    )
    === ""
  )
  ? timecode
  : "00:00:00.00"
)

export const runFfmpeg = ({
  args,
  envVars,
  ffmpegPath = defaultFfmpegPath,
  inputFilePaths,
  outputFilePath,
}: {
  args: string[]
  envVars?: (
    Record<
      string,
      string
    >
  ),
  ffmpegPath?: string
  inputFilePaths: string[]
  outputFilePath: string
}): (
  Observable<
    string
  >
) => (
  from(
    inputFilePaths
  )
  .pipe(
    mergeMap((
      inputFilePath,
    ) => (
      getMediaInfo(
        inputFilePath
      )
      .pipe(
        mergeMap((
          mediaInfo,
        ) => (
          getFileDuration({
            mediaInfo,
          })
        )),
      )
    )),
    reduce(
      (
        longestDuration,
        duration,
      ) => (
        (
          duration
          > longestDuration
        )
        ? duration
        : longestDuration
      ),
      0,
    ),
    concatMap((
      duration,
    ) => (
      new Observable<
        string
      >((
        observer,
      ) => {
        const commandArgs = (
          [
            "-hide_banner",

            "-loglevel",
            "info",

            "-y",

            "-stats",

            ...(
              inputFilePaths
              .filter((
                inputFilePath,
              ) => (
                (
                  extname(
                    inputFilePath
                  )
                )
                !== ".xml"
              ))
              .flatMap((
                inputFilePath,
              ) => ([
                "-i",
                inputFilePath,
              ]))
            ),

            ...args,

            // ...(
            //   (
            //     attachmentFilePaths
            //     || []
            //   )
            //   .map((
            //     attachmentFilePath,
            //   ) => ({
            //     attachmentFilePath,
            //     fileExtension: (
            //       extname(
            //         attachmentFilePath
            //       )
            //     ),
            //   }))
            //   .filter(({
            //     fileExtension,
            //   }) => (
            //     fileExtension
            //     in extensionMimeType
            //   ))
            //   .flatMap(({
            //     attachmentFilePath,
            //     fileExtension,
            //   }) => ([
            //     "-attach",
            //     attachmentFilePath,
            //     "-metadata:s:t",
            //     (
            //       extensionMimeType
            //       [fileExtension as ExtensionMimeType]
            //     ),
            //   ]))
            // ),

            outputFilePath,
          ]
          .filter(
            Boolean
          )
        )

        console
        .info(
          (
            [ffmpegPath]
            .concat(
              commandArgs
            )
          ),
          "\n",
        )

        const childProcess = (
          spawn(
            ffmpegPath,
            commandArgs,
            {
              env: {
              ...process.env,
              ...envVars,
              },
            },
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
            console
            .info(
              data
              .toString()
            )
          },
        )

        childProcess
        .stderr
        .on(
          'data',
          (
            data,
          ) => {
            if (
              data
              .toString()
              .includes(
                "time="
              )
            ) {
              if (hasStarted) {
                cliProgressBar
                .update(
                  convertTimecodeToMilliseconds(
                    convertNaNToTimecode(
                      data
                      .toString()
                      .replace(
                        progressRegex,
                        "$1",
                      )
                    )
                  )
                )
              }
              else {
                hasStarted = true

                cliProgressBar
                .start(
                  (
                    duration
                    * 1000
                    // fileSizeInKilobytes
                    // * fileSizeMultiplier
                  ),
                  (
                    convertTimecodeToMilliseconds(
                      convertNaNToTimecode(
                        data
                        .toString()
                        .replace(
                          progressRegex,
                          "$1",
                        )
                      )
                    )
                  ),
                  {},
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
        .on(
          'close',
          (
            code,
          ) => {
            if (
              code
              === null
            ) {
              unlink(
                outputFilePath
              )
              .then(() => {
                logWarning(
                  "ffmpeg",
                  "Process canceled by user.",
                )

                setTimeout(
                  () => {
                    process
                    .exit()
                  },
                  500,
                )
              })
            }
          },
        )

        childProcess
        .on(
          'exit',
          (
            code,
          ) => {
            if (
              code
              === 0
            ) {
              observer
              .next(
                outputFilePath
              )
            }

            observer
            .complete()

            cliProgressBar
            .stop()

            process
            .stdin
            .setRawMode(
              false
            )

            childProcess
            .stderr
            .unpipe()

            childProcess
            .stderr
            .destroy()

            childProcess
            .stdout
            .unpipe()

            childProcess
            .stdout
            .destroy()

            childProcess
            .stdin
            .end()

            childProcess
            .stdin
            .destroy()
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

        process
        .stdin
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
            else {
              process
              .stdout
              .write(
                key
              )
            }
          }
        )
      })
  )),
    catchNamedError(
      runFfmpeg
    ),
  )
)
