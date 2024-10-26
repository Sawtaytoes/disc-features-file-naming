// import {
//   readdir,
//   stat,
// } from "node:fs/promises"
import { of } from "rxjs"
import { afterEach, expect, test, vi } from "vitest"
import { TestScheduler } from "rxjs/testing"
import fs from "node:fs/promises"

import { readFiles } from "./readFiles.js"

test("reads files", () => {
  const spy1 = vi.spyOn(fs, 'readdir').mockImplementation((filePath) => {
    filePath
    return Promise.resolve(["file1.txt", "file2.md", "file3.txt"])
  });

  // const spy1 = vi.spyOn("node:fs/promises", "readdir", "get").mockResolvedValue(Promise.resolve(["file1.txt", "file2.md", "file3.txt"]))
  // const spy1 = vi.spyOn(fs, "constants", "get").mockResolvedValue(Promise.resolve(["file1.txt", "file2.md", "file3.txt"]))
  const spy2 = vi.spyOn("node:fs/promises", "stat", "get").mockResolvedValue(Promise.resolve({ isFile: () => true }))
  // mockImplementationOnce
  const filePath = "yo"

  readFiles({
    sourcePath: filePath,
  })
  .subscribe((a) => {
    expect(a).toBe({
      filename: "file1.txt",
      fullPath: "yo/file1.txt",
      renameFile: () => (
        of("null")
      ),
    })
  })

  spy1.mockRestore()
  spy2.mockRestore()

  expect(spy1).toHaveBeenCalledWith(filePath)
  expect(spy2).toHaveBeenCalledWith(filePath)
})
