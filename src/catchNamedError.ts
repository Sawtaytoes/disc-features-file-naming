import chalk from "chalk"
import {
  catchError,
  EMPTY,
} from "rxjs"

export const catchNamedError = (
  func: (
    | Function
    | string
  ),
): (
  ReturnType<
    typeof catchError
  >
) => (
  catchError((
    error,
  ) => {
    console
    .error(
      (
        chalk
        .red(
          (
            typeof func
            === 'function'
          )
          ? (
            func
            .name
          )
          : func
        )
      ),
      error,
    )

    // TODO: See if this needs to be removed.
    // process
    // .exit()

    return EMPTY
  })
)
