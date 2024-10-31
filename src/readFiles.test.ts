import { vol } from "memfs"
import { of } from "rxjs"
import { TestScheduler } from "rxjs/testing"
import { beforeEach, describe, expect, test } from "vitest"

import { getIsFile, readFiles } from "./readFiles.js"
import { runTestScheduler } from "./runTestScheduler.js"

describe("getIsFile", () => {
  beforeEach(() => {
    vol
    .fromJSON({
      "G:\\Movies\\MovieName (1993)\\MovieName (1993).mkv": "",
    })
  })

  test("returns stats if path is a file", async () => {
    runTestScheduler(({
      expectObservable,
    }) => {
      expectObservable(
        getIsFile(
          "G:\\Movies\\MovieName (1993)\\MovieName (1993).mkv"
        )
      )
      .toBe(
        "4444s (a|)",
        {
          a: void(0),
        },
      )
    })

    // console.time()

    // return (
    //   new Promise<void>((resolve, reject) => {
    //     getIsFile(
    //       "G:\\Movies\\MovieName (1993)\\MovieName (1993).mkv"
    //     )
    //     .subscribe({
    //       next: (value) => {
    //         console.timeEnd()
    //         expect(value).toBe(void(0))
    //         resolve()
    //       },
    //       error: reject,
    //       complete: reject,
    //     })
    //   })
    // )
  })

  test("completes if path is a directory", () => {
    vol
    .fromJSON({
      "G:\\Movies\\MovieName (1993)\\MovieName (1993).mkv": "",
    })

    runTestScheduler(({
      expectObservable,
    }) => {
      expectObservable(
        getIsFile(
          "G:\\Movies\\MovieName (1993)"
        )
      )
      .toBe(
        " |",
      )
    })

    // return (
    //   new Promise<void>((resolve, reject) => {
    //     getIsFile(
    //       "G:\\Movies\\MovieName (1993)"
    //     )
    //     .subscribe({
    //       next: reject,
    //       error: reject,
    //       complete: resolve,
    //     })
    //   })
    // )
  })
})

describe("readFiles", () => {
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
