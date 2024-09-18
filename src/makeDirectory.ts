import {
  mkdir,
} from "node:fs/promises"
import {
  dirname,
} from "node:path"
import {
  from,
} from "rxjs";

export const makeDirectory = (
  filePath: string,
) => (
  from(
    mkdir(
      (
        dirname(
          filePath
        )
      ),
      { recursive: true },
    )
  )
)
