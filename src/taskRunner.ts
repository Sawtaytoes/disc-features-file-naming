import "@total-typescript/ts-reset"
import "dotenv/config"

import chalk from "chalk"
import {
  catchError,
  concatMap,
  EMPTY,
  from,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"

process
.on(
  "uncaughtException",
  (exception) => {
    console
    .error(
      exception
    )
  },
)

export type TaskRunnerProps = {
  options: {} // This needs to be a union of possible types tied to each for each script name. The whole params object needs to be a union.
  scriptName: string // This needs to define the actual script that has X options.
}

export const taskRunner = ({
  options,
  scriptName,
}: TaskRunnerProps) => (
  from(
    // TODO: Change this to a function import
    import(
      `${scriptName}.js`
    )
  )
  .pipe(
    catchError((
      error,
    ) => {
      console
      .error(
        error
      )

      console
      .error(
        "No script with the name:",
        scriptName,
      )

      return EMPTY
    }),
    concatMap(({
      [scriptName]: runScript,
    }) => (
      runScript(
        options
      )
    )),
    catchNamedError(
      scriptName
    ),
  )
)
