import fs from 'fs'
import path from 'path'
import _ from 'lodash'

import { generateTags } from './generateTags'

export const indexFile = (filename, fileOutput) => {
  const code = fs.readFileSync(filename).toString()
  const filepath = path.resolve(filename)
  const generatedData = generateTags(code, filepath).map(e => {
    return [e[0], e[1], e[2], e[3]].join('\t')
  })
  let existingData
  if (fs.existsSync(path)) {
    existingData = fs
      .readFileSync(fileOutput)
      .toString()
      .split('\n')
  } else {
    existingData = []
  }
  let newData = _.uniq(_.concat(generatedData, existingData)).sort()

  // Get rid of blank lines
  newData = newData.filter(item => {
    return item.trim() !== ''
  })
  fs.writeFileSync(fileOutput, `${newData.join('\n')}\n`, { flag: 'w' })
}

const filePattern = process.argv[2]
const fileOutput = process.argv[3]
indexFile(filePattern, fileOutput)
