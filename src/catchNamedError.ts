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
        (
          typeof func
          === 'function'
        )
        ? (
          func
          .name
        )
        : func
      ),
      error,
    )

    process
    .exit()
  })
)
