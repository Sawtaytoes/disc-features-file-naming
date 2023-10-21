import chalk from "chalk"
import {
  spawn,
} from "node:child_process";
import {
  Observable,
} from "rxjs"

import { mkvPropEditPath } from "./appPaths.js";
import { catchNamedError } from "./catchNamedError.js"

export const runMkvPropEdit = ({
  args,
  filePath,
}: {
  args: string[]
  filePath: string
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
    const commandArgs = [
      filePath,
      ...args
    ]

    console
    .info(
      (
        [mkvPropEditPath]
        .concat(
          commandArgs
        )
        .join(" ")
      ),
      "\n",
    )

    const childProcess = (
      spawn(
        mkvPropEditPath,
        commandArgs,
      )
    )

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
            filePath
          )
        }

        observer
        .complete()

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
      runMkvPropEdit
    ),
  )
)
