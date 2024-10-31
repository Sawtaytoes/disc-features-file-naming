import { RunHelpers, TestScheduler } from "rxjs/testing"
import { expect } from "vitest";

export const runTestScheduler = <
  ReturnValue
>(
  testRunner: (
    helpers: RunHelpers,
  ) => (
    ReturnValue
  )
) => {
  const testScheduler = (
    new TestScheduler((
      actual,
      expected,
    ) => {
      expect(
        actual
      )
      .toEqual(
        expected
      );
    })
  )

  return (
    testScheduler
    .run<
      ReturnValue
    >(
      testRunner
    )
  )
}
