import { vol } from "memfs"
import { EmptyError, firstValueFrom, toArray } from "rxjs"
import { beforeEach, describe, expect, test } from "vitest"

import { FileInfo, filterFileAtPath, readFiles } from "./readFiles.js"
import { getOperatorValue } from "./test-runners.js"
import { captureLogMessage } from "./logMessage.js"
import { createRenameFileOrFolderObservable } from "./createRenameFileOrFolder.js"

describe(filterFileAtPath.name, () => {
  beforeEach(() => {
    vol
    .fromJSON({
      "G:\\Movies\\Super Mario Bros (1993)\\Super Mario Bros (1993).mkv": "",
    })
  })

  test("emits if path is a file", async () => {
    const inputValue = "G:\\Movies\\Super Mario Bros (1993)\\Super Mario Bros (1993).mkv"

    expect(
      getOperatorValue(
        filterFileAtPath((
          filePath
        ) => (
          filePath
        )),
        inputValue,
      )
    )
    .resolves
    .toBe(
      inputValue
    )
  })

  test("completes if path is a directory", async () => {
    const inputValue = "G:\\Movies\\Super Mario Bros (1993)"

    expect(
      getOperatorValue(
        filterFileAtPath((
          filePath
        ) => (
          filePath
        )),
        inputValue,
      )
    )
    .rejects
    .toThrow(EmptyError)
  })
})

describe(readFiles.name, () => {
  test("completes if no files", async () => {
    await captureLogMessage(
      "error",
      async (
        consoleSpy
      ) => {
        await expect(
          firstValueFrom(
            readFiles({
              sourcePath: "",
            })
          )
        )
        .rejects
        .toBeInstanceOf(
          EmptyError
        )

        expect(
          consoleSpy
          .mock
          .calls
          [0]
          .find((
            error
          ) => (
            error instanceof Error
            && (
              error
              .message
            )
          ))
          .message
        )
        .toContain(
          "no such file or directory"
        )
      }
    )
  })
  })
})
