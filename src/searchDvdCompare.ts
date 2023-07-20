import puppeteer from "puppeteer"
import {
  from,
  map,
  mergeMap,
  type Observable,
} from "rxjs"

import { catchNamedError } from "./catchNamedError"

export const searchDvdCompare = ({
  url,
}: {
  url: string,
}): (
  Observable<
    string
  >
) => (
  from(
    puppeteer
    .launch({
      headless: "new",
      // headless: false,
    })
  )
  .pipe(
    mergeMap((
      browser,
    ) => (
      from(
        browser
        .newPage()
      )
      .pipe(
        mergeMap((
          page,
        ) => (
          from(
            page
            .goto(
              url
              .replace(
                /(.+)(#.+)/,
                `$1&sel=on$2`
              )
            )
          )
          .pipe(
            // mergeMap(async () => {
            //   const uncheckAllElementHandler = (
            //     await (
            //       page
            //       .$(
            //         '[href$="&sel=on"]'
            //       )
            //     )
            //   )

            //   if (!uncheckAllElementHandler) {
            //     throw "No 'Uncheck All' button."
            //   }

            //   await (
            //     uncheckAllElementHandler
            //     .click()
            //   )

            //   await (
            //     page
            //     .waitForNavigation()
            //   )
            // }),
            mergeMap(async () => {
              const releasePackagesFormElementHandler = (
                await (
                  page
                  .$(
                    'form[action^="film.php"]'
                  )
                )
              )

              if (!releasePackagesFormElementHandler) {
                throw "No release packages to choose from."
              }

              const urlHash = (
                new URL(
                  url
                )
                .hash
                .replace(
                  /#(.+)/,
                  "$1",
                )
              )

              const releasePackageCheckboxElementHandler = (
                await (
                  releasePackagesFormElementHandler
                  .$(
                    `input[type="checkbox"][name="${urlHash}"]`
                  )
                )
              )

              if (!releasePackageCheckboxElementHandler) {
                throw "Incorrect or no release package selected."
              }

              await (
                releasePackageCheckboxElementHandler
                .click()
              )

              await (
                releasePackagesFormElementHandler
                .$(
                  '[type="submit"]'
                )
                .then((
                  submitButtonElementHandler
                ) => (
                  submitButtonElementHandler
                  ?.click()
                ))
              )

              await (
                page
                .waitForNavigation()
              )
            }),
            mergeMap(async () => {
              const urlHash = (
                new URL(
                  url
                )
                .hash
                .replace(
                  /#(.+)/,
                  "$1",
                )
              )

              const extrasElementHandler = (
                await (
                  page
                  .$x(
                    '//div[contains(@class, "label") and contains(text(), "Extras")]'
                  )
                )
              )

              if (
                (
                  extrasElementHandler
                  .length
                )
                === 0
              ) {
                throw "No extras for this release."
              }

              return (
                extrasElementHandler
                [0]
                .evaluate((
                  element,
                ) => (
                  (
                    element
                    ?.parentElement
                    ?.querySelector(
                      '.description'
                    )
                    ?.textContent
                  )
                  || (
                    element
                    ?.parentElement
                    ?.parentElement
                    ?.querySelector(
                      '.description'
                    )
                    ?.textContent
                  )
                  || ""
                ))
              )
            }),
            mergeMap((
              extrasText,
            ) => (
              from(
                browser
                .close()
              )
              .pipe(
                map(() => (
                  extrasText
                ))
              )
            )),
          )
        )),
      )
    )),
    catchNamedError(
      searchDvdCompare
    ),
  )
)
