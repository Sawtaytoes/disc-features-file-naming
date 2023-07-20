import readline from "node:readline"
import {
  Observable,
} from "rxjs"

export const getUserSearchInput = () => (
  new Observable<
    number
  >((
    observer,
  ) => {
    const readlineInterface = (
      readline
      .createInterface({
        input: (
          process
          .stdin
        ),
        output: (
          process
          .stdout
        ),
        terminal: false,
      })
    )

    readlineInterface
    .on(
      'line',
      (
        index,
      ) => {
        observer
        .next(
          Number(
            index
          )
        )

        readlineInterface
        .close()

        observer
        .complete()
      },
    )
  })
)
