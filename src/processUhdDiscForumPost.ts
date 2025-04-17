import { JSDOM } from "jsdom"

export type UhdDiscForumPostItem = {
  movieName: string
  publisher?: string
  reasons?: string[]
}

export type UhdDiscForumPostSection = {
  sectionTitle: string
}

export type UhdDiscForumPostGroup = {
  items: UhdDiscForumPostItem[]
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

export const getReasonsFromDomSnippet = (
  jsdomSnippet: JSDOM,
) => (
  Array
  .from(
    (
      jsdomSnippet
      .window
      .document
      .querySelectorAll(
        'span'
      )
    )
    || []
  )
  .map((
    element
  ) => (
    element
    ?.textContent
  ))
  .filter((
    textContent
  ): textContent is string => (
    Boolean(
      textContent
    )
  ))
  .flatMap((
    textContent
  ) => (
    textContent
    .matchAll(
      /\((?<reason>.+?)\)/g
    )
  ))
  .flatMap((
    reasonMatchesIterator
  ) => (
    Array
    .from(
      reasonMatchesIterator
    )
  ))
  .flatMap((
    reasonsMatches
  ) => (
    reasonsMatches
    ?.groups
    ?.reason
  ))
  .filter((
    reason
  ): reason is string => (
    Boolean(
      reason
    )
  ))
  .map((
    reason
  ) => (
    reason
    .trim()
  ))
  .filter(
    Boolean
  )
)

export const getSectionTitleFromDomSnippet = (
  jsdomSnippet: JSDOM,
) => (
  (
    (
      jsdomSnippet
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
)

export const parseDomSnippetTextContent = (
  jsdomSnippet: JSDOM,
) => ({
  reasons: (
    getReasonsFromDomSnippet(
      jsdomSnippet
    )
  ),
  sectionTitle: (
    getSectionTitleFromDomSnippet(
      jsdomSnippet
    )
  ),
  movieMatch: (
    (
      (
        getParentText(
          jsdomSnippet
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
})

export const processUhdDiscForumPost = (
  /** HTML string of the content from the forum post. */
  formPostContent: string
) => (
  formPostContent
  .split(
    "<br>"
  )
  .filter(
    Boolean
  )
  .map((
    htmlSection,
  ) => (
    new JSDOM(
      htmlSection
    )
  ))
  .map((
    jsdomSnippet,
  ) => (
    parseDomSnippetTextContent(
      jsdomSnippet
    )
  ))
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
                UhdDiscForumPostGroup
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
                  UhdDiscForumPostGroup
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
      UhdDiscForumPostGroup[]
    ) as (
      UhdDiscForumPostGroup[]
    ),
  )
)
