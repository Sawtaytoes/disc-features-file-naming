import yargs from "yargs"
import { hideBin } from "yargs/helpers"

import { nameAnimeEpisodes } from "./nameAnimeEpisodes.js"
import { runTask } from "./taskRunner.js"

const argv = (
  yargs(
    hideBin(
      process
      .argv
    )
  )
  .scriptName(
    "media"
  )
  .usage(
    "Usage: $0 <cmd> [args]"
  )
  .command(
    "nameAnimeEpisodes <sourcePath> <searchTerm>",
    "Name all anime episodes in a directory according to episode names in MyAnimeList.",
    (
      yargs
    ) => (
      yargs
      .example(
        "$0 \"~/anime\" \"psycho-pass\"",
        "Names all video files in the directory based on the episode names on MyAnimeList."
      )
      .option(
        "seasonNumber",
        {
          alias: "s",
          default: 1,
          describe: "The season number to output when renaming useful for TVDB which has separate season number. For aniDB, use the default value 1.",
          nargs: 1,
          number: true,
          type: "number",
        },
      )
      .positional(
        "sourcePath",
        {
          demandOption: true,
          describe: "Directory where a single show is stored.",
          type: "string",
        },
      )
      .positional(
        "searchTerm",
        {
          demandOption: true,
          describe: "Name of the anime for searching MyAnimeList.com.",
          type: "string",
        },
      )
    ),
    (argv) => {
      nameAnimeEpisodes({
        searchTerm: (
          argv
          .searchTerm
        ),
        sourcePath: (
          argv
          .sourcePath
        ),
        seasonNumber: (
          argv
          .seasonNumber
        ),
      })
      .subscribe()
    }
  )
  .strict()
  .argv
)

// runTask(
//   argv
// )
