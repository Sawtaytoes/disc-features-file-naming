import { join } from 'node:path'
import { type Configuration } from 'puppeteer'

const puppeteerConfiguration: Configuration = {
  cacheDirectory: (
    join(
      __dirname,
      '.cache',
      'puppeteer',
    )
  ),
}

export default puppeteerConfiguration
