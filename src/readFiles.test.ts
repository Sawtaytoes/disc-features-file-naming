import { vol } from "memfs"
import { EmptyError } from "rxjs"
import { beforeEach, describe, expect, test } from "vitest"

import { filterFileAtPath, readFiles } from "./readFiles.js"
import { getOperatorValue, runPromiseScheduler } from "./test-runners.js"

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
  test("reads files", () => {
    // const spy1 = vi.spyOn(fs, 'readdir').mockImplementation((filePath) => {
    //   filePath
    //   return Promise.resolve(["file1.txt", "file2.md", "file3.txt"])
    // });

    // // const spy1 = vi.spyOn("node:fs/promises", "readdir", "get").mockResolvedValue(Promise.resolve(["file1.txt", "file2.md", "file3.txt"]))
    // // const spy1 = vi.spyOn(fs, "constants", "get").mockResolvedValue(Promise.resolve(["file1.txt", "file2.md", "file3.txt"]))
    // const spy2 = vi.spyOn("node:fs/promises", "stat", "get").mockResolvedValue(Promise.resolve({ isFile: () => true }))
    // // mockImplementationOnce
    // const filePath = "yo"

    // readFiles({
    //   sourcePath: filePath,
    // })
    // .subscribe((a) => {
    //   expect(a).toBe({
    //     filename: "file1.txt",
    //     fullPath: "yo/file1.txt",
    //     renameFile: () => (
    //       of("null")
    //     ),
    //   })
    // })

    // spy1.mockRestore()
    // spy2.mockRestore()

    // expect(spy1).toHaveBeenCalledWith(filePath)
    // expect(spy2).toHaveBeenCalledWith(filePath)
  })
})
