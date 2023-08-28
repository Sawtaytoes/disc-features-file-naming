import malScraper from "mal-scraper"
import path from "node:path"
import readline from "node:readline"
import {
  concatMap,
  filter,
  from,
  map,
  mergeAll,
  mergeMap,
  Observable,
  tap,
  toArray,
  zip,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"
import { getArgValues } from "./getArgValues.js"
import { readFiles } from "./readFiles.js"

const {
  parentDirectory,
  seasonNumber,
  searchString,
} = (
  getArgValues()
)

export const nameAnimeEpisodes = () => (
  readFiles({
    parentDirectory,
  })
  .pipe(
    map((
      fileInfos,
    ) => (
      from(
        malScraper
        .getResultsFromSearch(
          (
            searchString
            || (
              path
              .basename(
                parentDirectory
              )
            )
          ),
          "anime",
        )
      )
      .pipe(
        mergeMap((
          animeList,
        ) => (
          new Observable<
            typeof animeList[0]
          >((
            observer,
          ) => {
            console
            .info(
              animeList
              .map((
                anime,
                index,
              ) => ({
                index,
                title: (
                  anime
                  .name
                ),
                airDate: (
                  anime
                  .payload
                  ?.aired
                ),
                type: (
                  anime
                  .payload
                  ?.media_type
                ),
              }))
            )

            const readlineInterface = (
              readline
              .createInterface({
                input: (
                  process
                  .stdin
                ),
                output: (
                  process
                  .stdout
                ),
                terminal: false,
              })
            )

            readlineInterface
            .on(
              'line',
              (
                index,
              ) => {
                observer
                .next(
                  animeList
                  .at(
                    Number(
                      index
                    )
                  )
                )

                readlineInterface
                .close()

                observer
                .complete()
              },
            )
          })
        )),
        filter(
          Boolean
        ),
        mergeMap(({
          id,
          name,
          url,
        }) => (
          zip(
            (
              malScraper
              .getInfoFromURL(
                url
              )
            ),
            (
              malScraper
              .getEpisodesList({
                id: (
                  Number(
                    id
                  )
                ),
                name,
              })
            ),
          )
        )),
      )
      .pipe(
        map(([
          series,
          seriesEpisodes,
        ]) => ({
          seriesEpisodes,
          seriesName: (
            (
              series
              .englishTitle
            )
            || (
              series
              .title
            )
            || (
              series
              .synonyms
              .at(0)
            )
            || (
              series
              .japaneseTitle
            )
            || ""
          ),
        })),
        tap(console.log),
        mergeMap(({
          seriesName,
          seriesEpisodes,
        }) => (
          from(
            fileInfos
          )
          .pipe(
            map((
              fileInfo,
              index,
            ) => ({
              episode: (
                seriesEpisodes
                .at(
                  index
                )
              ),
              fileInfo,
            })),
            map(({
              episode,
              fileInfo,
            }) => ({
              episodeNumber: (
                (
                  episode
                  ?.epNumber
                )
                ? (
                  String(
                    episode
                    ?.epNumber
                  )
                )
                : ""
              ),
              fileInfo,
              seasonNumber: (
                seasonNumber
                || "1"
              ),
              title: (
                (
                  episode
                  ?.title
                )
                || (
                  episode
                  ?.japaneseTitle
                )
                || ""
              ),
            })),
            tap(console.log),
            map(({
              episodeNumber,
              fileInfo,
              seasonNumber,
              title,
            }) => ({
              fileInfo,
              renamedFilename: (
                seriesName
                .concat(
                  " - ",
                  "s",
                  (
                    seasonNumber
                    .padStart(
                      2,
                      '0',
                    )
                  ),
                  "e",
                  (
                    episodeNumber
                    .padStart(
                      2,
                      '0',
                    )
                  ),
                  " - ",
                  title,
                )
                .replaceAll(
                  /: /g,
                  " - ",
                )
              )
            })),
          )
        )),
      )
    )),
    toArray(),
    mergeAll(),
    mergeAll(),
    // mergeMap(({
    //   fileInfo,
    //   renamedFilename,
    // }) => (
    //   fileInfo
    //   .renameFile(
    //     renamedFilename
    //   )
    // )),
    catchNamedError(
      nameAnimeEpisodes
    )
  )
)

nameAnimeEpisodes()
.subscribe()
