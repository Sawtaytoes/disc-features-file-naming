import puppeteer from "puppeteer"
import {
  concatMap,
  filter,
  from,
  map,
  mergeAll,
  mergeMap,
  tap,
  throwError,
  toArray,
} from "rxjs"

import { catchNamedError } from "./catchNamedError"
import { getUserSearchInput } from "./getUserSearchInput"

export const searchDvdCompare = ({
  searchTerm,
}: {
  searchTerm: string,
}) => (
  from(
    puppeteer
    .launch({
      // headless: 'new',
      headless: false,
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
              "https://www.dvdcompare.net/comparisons/search.php"
            )
          )
          .pipe(
            mergeMap(() => (
              page
              .$(
                '[action="/comparisons/search.php"]'
                .concat(
                  " ",
                  '[name="param"]',
                )
              )
            )),
            mergeMap((
              searchInputElement,
            ) => (
              searchInputElement
              ? (
                from(
                  searchInputElement
                  .type(
                    searchTerm
                  )
                )
                .pipe(
                  mergeMap(() => (
                    searchInputElement
                    .press(
                      'Enter'
                    )
                  )),
                )
              )
              : (
                throwError(() => (
                  "Cannot find search box."
                ))
              )
            )),
            mergeMap(() => (
              page
              .waitForNavigation()
            )),
            mergeMap(() => (
              page
              .$$(
                "[href^=\"film.php\"]"
              )
            )),
            mergeMap((
              discReleaseElements
            ) => (
              from(
                discReleaseElements
              )
              .pipe(
                concatMap((
                  discReleaseElement,
                ) => (
                  discReleaseElement
                  .evaluate((
                    discReleaseElement,
                  ) => (
                    (
                      (
                        discReleaseElement
                        .textContent
                      )
                      || ""
                    )
                    .replace(
                      /\s\s+/,
                      " ",
                    )
                  ))
                )),
                map((
                  discReleaseText,
                  index,
                ) => (
                  String(
                    index
                  )
                  .concat(
                    " ",
                    discReleaseText,
                  )
                )),
                tap((
                  discReleaseText,
                ) => {
                  console
                  .info(
                    discReleaseText
                  )
                }),
                toArray(),
                mergeMap(() => (
                  getUserSearchInput()
                )),
                map((
                  index,
                ) => (
                  discReleaseElements
                  .at(
                    index
                  )
                )),
                mergeMap((
                  selectedDiscReleaseElement,
                ) => (
                  selectedDiscReleaseElement
                  ? (
                    from(
                      selectedDiscReleaseElement
                      .type(
                        searchTerm
                      )
                    )
                    .pipe(
                      mergeMap(() => (
                        selectedDiscReleaseElement
                        .click()
                      )),
                    )
                  )
                  : (
                    throwError(() => (
                      "No selected disc release."
                    ))
                  )
                )),
              )
            )),
            mergeMap(() => (
              page
              .waitForNavigation()
            )),
            mergeMap(() => (
              page
              .$(
                "[action^=\"film.php\"]"
              )
            )),
            mergeMap((
              formElement,
            ) => (
              formElement
              ? (
                from(
                  formElement
                  .$$(
                    "a"
                  )
                )
                .pipe(
                  mergeMap((
                    releasePackageElements
                  ) => (
                    from(
                      releasePackageElements
                    )
                    .pipe(
                      concatMap((
                        releasePackageElement
                      ) => (
                        releasePackageElement
                        .evaluate((
                          releasePackageElement,
                        ) => (
                          (
                            releasePackageElement
                            .textContent
                          )
                          || ""
                        ))
                      )),
                      map((
                        releasePackageText,
                        index,
                      ) => (
                        String(
                          index
                        )
                        .concat(
                          " ",
                          releasePackageText,
                        )
                      )),
                      tap((
                        releasePackageText,
                      ) => {
                        console
                        .info(
                          releasePackageText
                        )
                      }),
                      toArray(),
                      mergeMap(() => (
                        getUserSearchInput()
                      )),
                      map((
                        index,
                      ) => (
                        releasePackageElements
                        .at(
                          index
                        )
                      )),
                      mergeMap((
                        selectedReleasePackageElement,
                      ) => (
                        selectedReleasePackageElement
                        ? (
                          from(
                            selectedReleasePackageElement
                            .evaluate((
                              releasePackageElement,
                            ) => (
                              (
                                (
                                  releasePackageElement
                                  .getAttribute(
                                    'href'
                                  )
                                )
                                || ""
                              )
                              .replace(
                                /#(\d+)/,
                                "$1",
                              )
                            ))
                          )
                        )
                        : (
                          throwError(() => (
                            "No selected release package."
                          ))
                        )
                      )),
                      mergeMap((
                        selectedCheckboxName,
                      ) => (
                        from(
                          formElement
                          .$$(
                            '[type="checkbox"]'
                          )
                        )
                        .pipe(
                          mergeAll(),
                          mergeMap((
                            checkboxElement,
                          ) => (
                            checkboxElement
                            .toElement('input')
                            .then((
                              element
                            ) => (
                              element
                              .getProperty('name')
                            ))
                            .then((
                              nameProperty,
                            ) => (
                              nameProperty
                              .jsonValue()
                            ))
                          )),
                          toArray(),
                          mergeMap(() => (
                            formElement
                            .$(
                              '[type="submit"]'
                            )
                            .then((
                              submitButtonElement
                            ) => (
                              submitButtonElement
                              ?.click()
                            ))
                          )),
                        )
                      )),
                    )
                  )),
                )
              )
              : (
                throwError(() => (
                  "No release packages to choose from."
                ))
              )
            )),
            mergeMap(() => (
              browser
              .close()
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
