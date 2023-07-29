import "@total-typescript/ts-reset"
import "dotenv/config"

import yargs from "yargs/yargs"
import { hideBin } from "yargs/helpers"
import { getArgValues } from "./getArgValues.js"

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

// const argv = (
//   yargs(
//     hideBin(
//       process
//       .argv
//     )
//   )
//   .scriptName(
//     "ts-node src/index.ts"
//   )
//   .usage(
//     "$0 <cmd> [args]"
//   )
//   .command(
//     "[scriptName]",
//     "Run a separate command.",
//     (
//       yargs,
//     ) => {
//       yargs
//       .positional(
//         "scriptName",
//         {
//           // default: "",
//           describe: "The name of a script to run.",
//           type: "string",
//         },
//       )
//     },
//     (
//       argv,
//     ) => {
//       console
//       .info(
//         "hello",
//         argv.name,
//         "welcome to yargs!"
//       )
//     }
//   )
//   .help()
//   .demandCommand(
//     1
//   )
//   .strict()
//   .argv
// )

const {
  parentDirectory,
  scriptName,
  url
} = (
  getArgValues()
)

import(
  `${scriptName}.ts`
)
.then((
  createObservable,
) => (
  createObservable({
    parentDirectory,
    url,
  })
  .subscribe()
))
