import yargs from "yargs"
import { hideBin } from "yargs/helpers"

import { nameAnimeEpisodes } from "./nameAnimeEpisodes.js"
import { taskRunner } from "./taskRunner.js"

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
.example(
  "$0 \"~/anime\" \"psycho-pass\"",
  "Names all video files in the directory based on the episode names on MyAnimeList."
)
.option(
  "s",
  {
    alias: "season-number",
    default: 1,
    describe: "The season number to output when renaming useful for TVDB which has separate season number. For aniDB, use the default value 1.",
    nargs: 1,
    type: "number",
  },
)
.command(
  "nameAnimeEpisodes <s>",
  "Name all anime episodes in a directory according to episode names in MyAnimeList.",
  (
    argv
  ) => (
    nameAnimeEpisodes({
      directory: argv[0],
      seasonNumber: argv["season-number"],
      searchString: argv[1],
    })
  )
)
.strict()
.argv
