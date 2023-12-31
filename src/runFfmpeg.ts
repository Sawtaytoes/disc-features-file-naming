import colors from "ansi-colors"
import chalk from "chalk"
import cliProgress from "cli-progress"
import {
  spawn,
} from "node:child_process";
import {
  unlink,
} from "node:fs/promises"
import {
  Observable,
} from "rxjs"

import { ffmpegPath } from "./appPaths.js";
import { catchNamedError } from "./catchNamedError.js"
import { extname } from "node:path";

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

const progressRegex = (
  /.*size=[\s\t]*(\d+)kB.*/
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

export const runFfmpeg = ({
  args,
  attachmentFilePaths,
  fileSizeInKilobytes,
  inputFilePaths,
  outputFilePath,
}: {
  args: string[]
  attachmentFilePaths?: string[]
  fileSizeInKilobytes: number
  inputFilePaths: string[]
  outputFilePath: string
}): (
  Observable<
    string
  >
) => (
  new Observable<
    string
  >((
    observer,
  ) => {
    const commandArgs = (
      [
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

        ...(
          (
            attachmentFilePaths
            || []
          )
          .map((
            attachmentFilePath,
          ) => ({
            attachmentFilePath,
            fileExtension: (
              extname(
                attachmentFilePath
              )
            ),
          }))
          .filter(({
            fileExtension,
          }) => (
            fileExtension
            in extensionMimeType
          ))
          .flatMap(({
            attachmentFilePath,
            fileExtension,
          }) => ([
            "-attach",
            attachmentFilePath,
            "-metadata:s:t",
            (
              extensionMimeType
              [fileExtension as ExtensionMimeType]
            ),
          ]))
        ),

        ...args,

        "-loglevel",
        "info",

        "-y",

        "-stats",

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
            "size="
          )
        ) {
          if (hasStarted) {
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
          else {
            hasStarted = true

            cliProgressBar
            .start(
              fileSizeInKilobytes,
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
            console
            .info(
              chalk
              .red(
                "Process canceled by user."
              )
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
  .pipe(
    catchNamedError(
      runFfmpeg
    ),
  )
)
