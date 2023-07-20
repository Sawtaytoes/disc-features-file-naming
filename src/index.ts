import "@total-typescript/ts-reset"
import "dotenv/config"

import {
  AnidbUDPClient,
  SimplePersistentCache,
} from "anidb-udp-client"
import express from "express"
import malScraper from "mal-scraper"
// @ts-ignore
import MyAnimeListOAuth from "myanimelist-oauth"
import {
  readdir,
  rename,
  stat,
} from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import readline from "node:readline"
import {
  catchError,
  combineLatest,
  EMPTY,
  filter,
  finalize,
  from,
  groupBy,
  ignoreElements,
  map,
  merge,
  mergeAll,
  mergeMap,
  Observable,
  of,
  take,
  tap,
  toArray,
  zip,
} from "rxjs"

process
.on(
  "uncaughtException",
  (exception) => {
    console
    .error(
      exception
    )
  },
)


// -----------------------------------------------------

const parentDirectory = (
  process
  .argv
  .at(2)
)

if (!parentDirectory) {
  throw new Error('You need to enter a parent directory.')
}

const seasonNumber = (
  process
  .argv
  .at(3)
)

const searchString = (
  process
  .argv
  .at(4)
)

// const anidbClient = (
//   new AnidbUDPClient(
//     'myanimefilenamer',
//     {
//       cache: (
//         new SimplePersistentCache({
//           save_path: './.cache/',
//         })
//       ),
//     },
//   )
// )

// const oauthTokenReceiver = (
//   new Observable<{
//     //
//   }>((
//     observer,
//   ) => {
//     const app = express()

//     const server = (
//       app
//       .listen(
//         "3000",
//         () => {
//           console.log("Listening on port 3000...")
//         },
//       )
//     )

//     var myAnimeListOAuth = (
//       new MyAnimeListOAuth({
//         clientID: (
//           process
//           .env
//           .MYANIMELIST_CLIENT_ID
//         ),
//         callback: "http://localhost:3000/myanimelist/callback",
//       })
//     )

//     app
//     .get(
//       "/auth",
//       (
//         myAnimeListOAuth
//         .authorize
//       ),
//     )

//     app
//     .get(
//       "/myanimelist/callback",
//       (
//         myAnimeListOAuth
//         .access_token
//       ),
//       (
//         req,
//         res,
//       ) => {
//         observer
//         .next(
//           req
//           // @ts-ignore
//           .get_data
//         )

//         server
//         .close(() => {
//           console.log(
//             "Closed out remaining server connections"
//           )
//         })

//         observer
//         .complete()
//       },
//     )

//     fetch('/auth').then(console.log).catch(console.error)
//   })
// )

// zip(
  // (
  //   from(
  //     anidbClient
  //     .connect(
  //       (
  //         process
  //         .env
  //         .ANIDB_USERNAME
  //       ),
  //       (
  //         process
  //         .env
  //         .ANIDB_PASSWORD
  //       ),
  //     )
  //     // oauthTokenReceiver
  //   )
  //   .pipe(
  //     filter(
  //       Boolean
  //     ),
  //     map(({
  //       session: accessToken,
  //     }) => (
  //       ({
  //         query,
  //         url,
  //       }: {
  //         query: (
  //           Record<
  //             string,
  //             string
  //           >
  //         )
  //         url: string,
  //       }) => (
  //         fetch(
  //           (
  //             "https://api.myanimelist.net/v2/"
  //             .concat(
  //               url,
  //               (
  //                 query
  //                 ? (
  //                   "?"
  //                   .concat(
  //                     new URLSearchParams(
  //                       query
  //                     )
  //                     .toString()
  //                   )
  //                 )
  //                 : ''
  //               ),
  //             )
  //           ),
  //           {
  //             headers: {
  //               "Authorization": (
  //                 "Bearer "
  //                 .concat(
  //                   accessToken
  //                 )
  //               ),
  //             },
  //           },
  //         )
  //       )
  //     )),
  //   )
  // ),
  // (
  //   )
from(
  readdir(
    parentDirectory
  )
)
.pipe(
  mergeAll(),
  // filter((
  //   filename,
  // ) => (
  //   filename
  //   // -------------------------------------
  //   // UNCOMMENT THIS TIME TO TEST A SINGLE FILE
  //   // && filename.startsWith('The Rock')
  //   // -------------------------------------
  // )),
  map((
    filename,
  ) => (
    parentDirectory
    .concat(
      path.sep,
      filename,
    )
  )),
  // take(12),
  mergeMap((
    filename,
  ) => (
    from(
      stat(
        filename
      )
    )
    .pipe(
      filter((
        stats
      ) => (
        stats
        .isFile()
      )),
      map(() => (
        filename
      )),
    )
  )),
  filter((
    filename,
  ) => (
    Boolean(
      filename
    )
  )),
  toArray(),
  map((
    filenames,
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
      // tap(console.log),
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
      // mergeMap((
      //   animeList
      // ) => (
      //   // fetchMyAnimeListData({
      //   //   query: {
      //   //     limit: "1",
      //   //     q: filename,
      //   //   },
      //   //   url: "anime",
      //   // })
      //   anidbClient
      //   .anime(
      //     (
      //       animeList
      //       .at(0)
      //       .id
      //     ),
      //     [
      //       'english_name',
      //       //
      //     ],
      //   )
      // ))
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
      mergeMap(({
        seriesName,
        seriesEpisodes,
      }) => (
        from(
          filenames
        )
        .pipe(
          // tap(console.log),
          map((
            filename,
            index,
          ) => ({
            episode: (
              seriesEpisodes
              .at(
                index
              )
            ),
            filename,
          })),
          map(({
            episode,
            filename,
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
            filename,
            // releaseYear: (
            //   (
            //     episode
            //     ?.aired
            //   )
            //   ? (
            //     String(
            //       new Date(
            //         episode
            //         ?.aired
            //       )
            //       .getFullYear()
            //     )
            //   )
            //   : ""
            // ),
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
          map(({
            episodeNumber,
            filename,
            // releaseYear,
            seasonNumber,
            title,
          }) => ({
            nextFilename: (
              seriesName
              .concat(
                // " (",
                // releaseYear,
                // ")",
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
            ),
            previousFilename: filename,
          })),
          map(({
            nextFilename,
            previousFilename,
          }) => ({
            nextFilename: (
              path
              .join(
                parentDirectory,
                (
                  nextFilename
                  .replaceAll(
                    /: /g,
                    " - ",
                  )
                  .concat(
                    path
                    .extname(
                      previousFilename
                    )
                  )
                ),
              )
            ),
            previousFilename,
          })),
        )
      )),
    )
  )),
  mergeAll(
    os
    .cpus()
    .length
  ),
  filter(({
    nextFilename,
    previousFilename,
  }) => (
    nextFilename
    !== previousFilename
  )),
  tap(({
    nextFilename,
    previousFilename,
  }) => {
    console.log(
      previousFilename,
      "\n",
      nextFilename,
      "\n",
      "\n",
    )
  }),
  // -------------------------------------
  // UNCOMMENT THIS TO SAFELY DEBUG CHANGES
  // -------------------------------------
  // ignoreElements(),
  // -------------------------------------
  map(({
    nextFilename,
    previousFilename,
  }) => (
    () => (
      rename(
        previousFilename,
        nextFilename,
      ))
    )
  ),
  mergeMap(
    (
      func
    ) => (
      func()
    ),
    (
      os
      .cpus()
      .length
    ),
  ),
  // finalize(() => {
  //   anidbClient
  //   .disconnect()
  // }),
  catchError((
    error,
  ) => {
    console
    .error(
      error
    )

    return EMPTY
  }),
)
.subscribe()
