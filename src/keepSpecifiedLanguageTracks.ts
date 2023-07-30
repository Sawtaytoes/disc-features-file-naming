import cliProgress from "cli-progress"
import colors from "ansi-colors"
import {
  spawn,
} from "node:child_process";
import {
  unlink,
} from "node:fs/promises"
import {
  Observable,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"
import { Iso6392LanguageCode } from "./Iso6392LanguageCode.js"

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
    string
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
          data
          .toString()
          .startsWith(
            "Progress:"
          )
        ) {
          if (
            !hasStarted
          ) {
            hasStarted = true

            cliProgressBar
            .start(
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
        .next(
          newFilePath
        )

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
  })
  .pipe(
    catchNamedError(
      keepSpecifiedLanguageTracks
    ),
  )
)
