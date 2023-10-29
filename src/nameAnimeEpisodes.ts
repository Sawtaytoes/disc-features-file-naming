import malScraper from "mal-scraper"
import {
  basename,
  extname,
} from "node:path"
import readline from "node:readline"
import {
  concatMap,
  filter,
  from,
  map,
  mergeAll,
  mergeMap,
  Observable,
  toArray,
  zip,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"
import { cleanupFilename } from "./cleanupFilename.js"
import { getRandomString } from "./getRandomString.js"
import { naturalSort } from "./naturalSort.js"
import { readFiles } from "./readFiles.js"
import { videoFileExtensions } from "./videoFileExtensions.js"
import { getIsVideoFile } from "./getIsVideoFile.js"

export const nameAnimeEpisodes = ({
  searchTerm,
  seasonNumber,
  sourcePath,
}: {
  searchTerm: string,
  seasonNumber: number,
  sourcePath: string,
}) => (
  readFiles({
    sourcePath,
  })
  .pipe(
    map((
      fileInfos,
    ) => (
      from(
        malScraper
        .getResultsFromSearch(
          (
            searchTerm
            || (
              basename(
                sourcePath
              )
            )
          ),
          "anime",
        )
      )
      .pipe(
        concatMap((
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
        concatMap(({
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
        concatMap(({
          seriesName,
          seriesEpisodes,
        }) => (
          from(
            naturalSort(
              fileInfos
            )
            .by({
              asc: (
                fileInfo,
              ) => (
                fileInfo
                .filename
              ),
            })
          )
          .pipe(
            filter((
              fileInfo,
            ) => (
              getIsVideoFile(
                fileInfo
                .fullPath
              )
            )),
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
                String(
                  seasonNumber
                )
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
                || (
                  getRandomString()
                )
              ),
            })),
            map(({
              episodeNumber,
              fileInfo,
              seasonNumber,
              title,
            }) => ({
              fileInfo,
              renamedFilename: (
                cleanupFilename(
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
    mergeMap(({
      fileInfo,
      renamedFilename,
    }) => (
      fileInfo
      .renameFile(
        renamedFilename
      )
    )),
    catchNamedError(
      nameAnimeEpisodes
    )
  )
)
