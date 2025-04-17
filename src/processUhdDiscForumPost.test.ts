import { JSDOM } from "jsdom"
import { describe, expect, test } from "vitest"

import {
  getReasonsFromDomSnippet,
  getSectionTitleFromDomSnippet,
  parseDomSnippetTextContent,
  processUhdDiscForumPost,
} from "./processUhdDiscForumPost.js"
import { postContentInnerHtml } from "./uhdDiscForumPostMocks.js"

describe(getReasonsFromDomSnippet.name, () => {
  test("returns an array of objects", () => {
    const reasonsFromDomSnippet = (
      getReasonsFromDomSnippet(
        new JSDOM(`
          <span style="color:#000000">Point Break (Icon UK &gt; Shout US)</span> <span style="color:#008000">(better encode &amp; good OG 2.0 audio)</span><br>
        `)
      )
    )

    expect(
      reasonsFromDomSnippet
    )
    .toEqual([
      "Icon UK > Shout US",
      "better encode & good OG 2.0 audio",
    ])
  })

  describe("returns null array", () => {
    test("when no valid reason", () => {
      const reasonsFromDomSnippet = (
        getReasonsFromDomSnippet(
          new JSDOM(`
            Trick or Treat (Arrow) <a href="https://criterionforum.org/forum/viewtopic.php?p=824600#p824600" class="postlink">capsule review</a>
          `)
        )
      )

      expect(
        reasonsFromDomSnippet
      )
      .toEqual([])
    })

    test("when section title", () => {
      const reasonsFromDomSnippet = (
        getReasonsFromDomSnippet(
          new JSDOM(`
            <span style="font-size:150%;line-height:116%"><strong class="text-strong"><span style="text-decoration:underline"><span style="color:#4080FF">Appreciable/Solid upgrades compared to the <span style="text-decoration:underline"><strong class="text-strong">most recent</strong></span> Blu-Rays:</span></span></strong></span><span style="text-decoration:underline">
          `)
        )
      )

      expect(
        reasonsFromDomSnippet
      )
      .toEqual([])
    })
  })
})

describe(getSectionTitleFromDomSnippet.name, () => {
  test("returns an array of objects", () => {
    const sectionTitleFromDomSnippet = (
      getSectionTitleFromDomSnippet(
        new JSDOM(`
          <span style="font-size:150%;line-height:116%"><strong class="text-strong"><span style="text-decoration:underline"><span style="color:#008000">Superior Imports/versions:</span></span></strong></span>
        `)
      )
    )

    expect(
      sectionTitleFromDomSnippet
    )
    .toBe("Superior Imports/versions")
  })
})

describe(parseDomSnippetTextContent.name, () => {
  test("returns an array of objects", () => {
    const parsedElementTextContent = (
      parseDomSnippetTextContent(
        new JSDOM(postContentInnerHtml.split("<br>").at(0))
      )
    )
  })
})

describe.skip(processUhdDiscForumPost.name, () => {
  test("returns an array of objects", () => {
    const uhdDiscForumPostGroups = (
      processUhdDiscForumPost(
        postContentInnerHtml
      )
    )

    expect(
      uhdDiscForumPostGroups
    )
    .toBeInstanceOf(
      Array
    )

    expect(
      uhdDiscForumPostGroups
      .at(0)
      ?.title
    )
    .toBe(
      "Reference 4K titles and/or spectacular upgrades from the most recent BD"
    )

    expect(
      uhdDiscForumPostGroups
      .at(1)
      ?.title
    )
    .toBe(
      "Appreciable/Solid upgrades compared to the most recent Blu-Rays"
    )
  })
})
