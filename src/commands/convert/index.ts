import {Args, Command} from '@oclif/core'
import * as fs from 'node:fs'
import * as https from 'node:https'
import * as path from 'node:path'

const SITE = 'https://daruma.run'
const TOKEN = 'clwmymuoe003xl637vzj20kg6'

/* Utilities */
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function replaceExt(filename: string, newExt: string) {
  const i = filename.lastIndexOf('.')
  if (i <= 0) {
    return filename
  }

  return filename.slice(0, i) + '.' + newExt
}

/* General download/upload functions */
function uploadFile(filePath: string, uploadUrl: string) {
  const fileName = path.basename(filePath)
  const fileContent = fs.readFileSync(filePath)

  return fetch(uploadUrl, {
    body: fileContent,
    headers: {
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Type': 'application/octet-stream',
    },
    method: 'PUT',
  })
}

function downloadFile(url: string, filename: string) {
  return https.get(url, (res) => {
    const file = fs.createWriteStream(filename)
    res.pipe(file)
    file.on('finish', () => {
      file.close()
      console.log(`Saved as "${filename}"`)
    })
  })
}

/* Daruma functions */
function createDaruma(filename: string) {
  return fetch(`${SITE}/api/daruma/import/file`, {
    body: JSON.stringify({
      filename,
    }),
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  }).then((res) => {
    if (res.ok) {
      return res.json()
    }

    throw new Error('Failed to create daruma')
  })
}

function convertFile(importId: string) {
  return fetch(`${SITE}/api/daruma/import/convert?importId=${importId}`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
    method: 'POST',
  }).then((res) => {
    if (res.ok) {
      return res.json()
    }

    throw new Error('Failed to convert')
  })
}

function getConversionStatus(taskId: string) {
  return fetch(`${SITE}/api/daruma/import/status/task?taskId=${taskId}`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  }).then((res) => {
    if (res.ok) {
      return res.json()
    }

    throw new Error('Failed to get conversion status')
  })
}

function getDarumaDownload(darumaId: string) {
  return fetch(`${SITE}/api/daruma/file?darumaId=${darumaId}`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  }).then((res) => {
    if (res.ok) {
      return res.json()
    }

    throw new Error('Failed to get download url')
  })
}

export default class Convert extends Command {
  static args = {
    file: Args.file({description: 'Design file (.fig/.sketch/.ai)', exists: true, required: true}),
  }

  static description = 'Convert design file (using online Daruma service)'

  async run(): Promise<void> {
    const {args} = await this.parse(Convert)

    // Check if the file exists
    const {file} = args
    if (!fs.existsSync(file)) {
      throw new Error('File not found: ' + file)
    }

    // Check if valid
    const filename = path.basename(file)
    if (
      !filename.toLowerCase().endsWith('.fig') &&
      !filename.toLowerCase().endsWith('.sketch') &&
      !filename.toLowerCase().endsWith('.ai')
    ) {
      throw new Error(`Unexpected file: ${filename}`)
    }

    // Obtain upload URL
    const {darumaImport, url} = await createDaruma(filename)
    if (!darumaImport.id || !darumaImport.darumaId) {
      throw new Error('Failed to create new daruma')
    }

    // Upload file
    const res = await uploadFile(file, url)
    if (!res.ok) {
      throw new Error('Failed to upload file')
    }

    // Start conversion
    const {taskId} = await convertFile(darumaImport.id)
    if (!taskId) {
      throw new Error('Failed to start convert')
    }

    // Wait until conversion is done
    const startTime = Date.now()
    do {
      /* eslint-disable no-await-in-loop */
      const {parse} = await getConversionStatus(taskId)
      if (parse) {
        break
      }

      await sleep(2000)
      /* eslint-enable no-await-in-loop */
    } while (Date.now() - startTime < 180_000)

    // Download converted file
    const {url: downloadUrl} = await getDarumaDownload(darumaImport.darumaId)
    await downloadFile(downloadUrl, replaceExt(filename, 'daruma'))
  }
}
