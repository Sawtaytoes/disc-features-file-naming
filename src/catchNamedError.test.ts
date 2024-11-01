import { concatMap, EmptyError, pipe, throwError } from "rxjs"
import { describe, expect, test } from "vitest"

import { catchNamedError } from "./catchNamedError.js"
import { getOperatorValue, runTestScheduler } from "./test-runners.js"
import { captureLogMessage } from "./logMessage.js"

describe(catchNamedError.name, () => {
  test("catches a pipeline error", () => {
    captureLogMessage(
      "error",
      (
        logMessageSpy
      ) => {
        runTestScheduler(({
          expectObservable,
        }) => {
          expectObservable(
            throwError(() => (
              "test error"
            ))
            .pipe(
              catchNamedError(
                "testFunction"
              )
            )
          )
          .toBe(
            "|"
          )
        })

        expect(
          logMessageSpy
        )
        .toHaveBeenCalledOnce()

        expect(
          logMessageSpy
          .mock
          .calls
          [0]
          .find((
            text
          ) => (
            text
            .includes(
              "testFunction"
            )
          ))
        )
        .toContain(
          "testFunction"
        )

        expect(
          logMessageSpy
          .mock
          .calls
          [0]
          .find((
            text
          ) => (
            text
            .includes(
              "test error"
            )
          ))
        )
        .toContain(
          "test error"
        )
      }
    )
  })

  test("logs an error buffer", () => {
    captureLogMessage(
      "error",
      (
        logMessageSpy
      ) => {
        runTestScheduler(({
          expectObservable,
        }) => {
          expectObservable(
            throwError(() => (
              Buffer
              .from(
                "test error"
              )
            ))
            .pipe(
              catchNamedError(
                "testFunction"
              )
            )
          )
          .toBe(
            "|"
          )
        })

        expect(
          logMessageSpy
        )
        .toHaveBeenCalledOnce()

        expect(
          logMessageSpy
          .mock
          .calls
          [0]
          .find((
            text
          ) => (
            text
            .includes(
              "testFunction"
            )
          ))
        )
        .toContain(
          "testFunction"
        )

        expect(
          logMessageSpy
          .mock
          .calls
          [0]
          .find((
            text
          ) => (
            text
            .includes(
              "test error"
            )
          ))
        )
        .toBe(
          "test error"
        )
      }
    )
  })
})
