import chalk from "chalk"
import {
  spawn,
} from "node:child_process";
import {
  Observable,
} from "rxjs"

import { audioOffsetFinderPath } from "./appPaths.js";
import { catchNamedError } from "./catchNamedError.js"

export const getOffsetFromAudioOffsetOutput = (
  audioOffsetOutputData: string
) => (
  Number(
    audioOffsetOutputData
    .replace(
      /Offset: ([-\d\.]+) \(seconds\)/,
      "$1",
    )
  )
  * 1000
)

export const runAudioOffsetFinder = ({
  destinationFilePath,
  sourceFilePath,
}: {
  destinationFilePath: string
  sourceFilePath: string
}): (
  Observable<
    number
  >
) => (
  new Observable<
    number
  >((
    observer,
  ) => {
    const commandArgs = [
      "--find-offset-of",
      sourceFilePath,
      "--within",
      destinationFilePath,
    ]

    console
    .info(
      (
        [audioOffsetFinderPath]
        .concat(
          commandArgs
        )
      ),
      "\n",
    )

    const childProcess = (
      spawn(
        audioOffsetFinderPath,
        commandArgs,
      )
    )

    let outputData: string = ""

    const appendOutputData = (
      moreOutputData: string
    ) => {
      outputData = (
        outputData
        .concat(
          moreOutputData
        )
      )
    }

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

        appendOutputData(
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
        (
          (
            code
            === null
          )
          ? (
            Promise
            .resolve()
            .then(() => {
              console
              .info(
                chalk
                .red(
                  "Process canceled by user."
                )
              )

              return (
                Promise
                .reject()
                .finally(() => {
                  setTimeout(
                    () => {
                      process
                      .exit()
                    },
                    500,
                  )
                })
              )
            })
          )
          : (
            Promise
            .resolve()
          )
        )
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
            getOffsetFromAudioOffsetOutput(
              outputData
            )
          )
        }

        observer
        .complete()

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
      runAudioOffsetFinder
    ),
  )
)
