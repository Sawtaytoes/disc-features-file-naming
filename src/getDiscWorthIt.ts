import { JSDOM } from "jsdom"
import puppeteer from "puppeteer"
import {
  from,
  map,
  mergeMap,
  type Observable,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"

export type WorthItItem = {
  movieName: string
  publisher?: string
  reasons?: string[]
}

export type WorthItSection = {
  sectionTitle: string
}

export type WorthItGroup = {
  items: WorthItItem[]
  title: string
}

export const getParentText = (
  element: HTMLElement,
) => {
  const clonedElement = (
    element
    .cloneNode(
      true
    ) as (
      HTMLElement
    )
  )

  Array
  .from(
    clonedElement
    .children
  )
  .forEach((
    childElement,
  ) => {
    clonedElement
    .removeChild(
      childElement
    )
  })

  return (
    clonedElement
    .textContent
  )
}

export const getDiscWorthIt = (): (
  Observable<
    WorthItGroup[]
  >
) => (
  from(
    puppeteer
    .launch({
      headless: true,
      // headless: "new",
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
              // "https://www.criterionforum.org/forum/viewtopic.php?t=17181#p739745"
              "https://www.criterionforum.org/forum/viewtopic.php?p=739745#p739745"
            )
          )
          .pipe(
            mergeMap(async () => {
              const forumPostContentHandler = (
                await (
                  page
                  .$(
                    '#post_content739745 > .content'
                  )
                )
              )

              if (!forumPostContentHandler) {
                throw "No forum post available."
              }

              const formPostContent = (
                await (
                  forumPostContentHandler
                  .evaluate((
                    element,
                  ) => (
                    (
                      element
                      ?.innerHTML
                    )
                    || ""
                  ))
                )
              )

              return (
                formPostContent
                .split(
                  "<br>"
                )
                .filter(
                  Boolean
                )
                .map((
                  html,
                ) => (
                  new JSDOM(
                    html
                  )
                ))
                .map((
                  dom,
                ) => ({
                  reasons: (
                    Array
                    .from(
                      (
                        (
                          (
                            dom
                            .window
                            .document
                            .querySelector(
                              'span'
                            )
                            ?.textContent
                          )
                          || ""
                        )
                        .trim()
                        .matchAll(
                          /\((.+?)\)/g
                        )
                      )
                      || []
                    )
                    .map((
                      descriptionMatch
                    ) => (
                      descriptionMatch
                      .at(1)
                    ))
                    .filter(
                      Boolean
                    )
                  ),
                  sectionTitle: (
                    (
                      (
                        dom
                        .window
                        .document
                        .querySelector(
                          '[style="font-size:150%;line-height:116%"]'
                        )
                        ?.textContent
                      )
                      || ""
                    )
                    .trim()
                    .replace(
                      /:$/,
                      "",
                    )
                  ),
                  movieMatch: (
                    (
                      (
                        getParentText(
                          dom
                          .window
                          .document
                          .body
                        )
                      )
                      || ""
                    )
                    .trim()
                    .match(
                      /^(.+) \((.+)\)$/
                    )
                  ),
                }))
                .map(({
                  movieMatch,
                  ...otherProps
                }) => ({
                  ...otherProps,
                  movieName: (
                    (
                      movieMatch
                      ?.at(1)
                    )
                    || ""
                  ),
                  publisher: (
                    movieMatch
                    ?.at(2)
                  ),
                }))
                .filter(({
                  sectionTitle,
                  movieName,
                }) => (
                  sectionTitle
                  || movieName
                ))
                .reduce(
                  (
                    groups,
                    {
                      sectionTitle,
                      ...worthItItem
                    },
                  ) => (
                    sectionTitle
                    ? (
                      groups
                      .concat({
                        items: [],
                        title: sectionTitle,
                      })
                    )
                    : (
                      groups
                      .slice(0, -1)
                      .concat({
                        ...(
                          (
                            groups
                            .at(-1)
                          )
                          || (
                            {} as (
                              WorthItGroup
                            )
                          )
                        ),
                        items: (
                          (
                            (
                              groups
                              .at(-1)
                            )
                            || (
                              {} as (
                                WorthItGroup
                              )
                            )
                          )
                          .items
                          .concat(
                            worthItItem
                          )
                        ),
                      })
                    )
                  ),
                  [] satisfies (
                    WorthItGroup[]
                  ) as (
                    WorthItGroup[]
                  ),
                )
              )
            }),
            mergeMap((
              worthItGroups,
            ) => (
              from(
                browser
                .close()
              )
              .pipe(
                map(() => (
                  worthItGroups
                ))
              )
            )),
          )
        )),
      )
    )),
    catchNamedError(
      getDiscWorthIt
    ),
  )
)
