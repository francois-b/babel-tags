const path = require('path')
import { generateTags } from '../src/generateTags'
import fs from 'fs'

describe('the generator', () => {
  it('works with files', () => {
    const code = fs.readFileSync(path.join(__dirname, 'example.js'), {
      encoding: 'utf-8',
    })
    const results = generateTags(code, 'example.js')
    const expected_results = [
      ['Foo', 'example.js', '1;"', 'i'],
      ['poof', 'example.js', '2;"', 'i'],
      ['paf', 'example.js', '2;"', 'i'],
      ['great', 'example.js', '3;"', 'i'],
      ['eggs', 'example.js', '4;"', 'i'],
      ['genFunc', 'example.js', '6;"', 'f'],
      ['genObj', 'example.js', '12;"', 'v'],
      ['users', 'example.js', '20;"', 'v'],
      ['Person', 'example.js', '26;"', 'f'],
      ['FooButBetter', 'example.js', '36;"', 'c'],
      ['a', 'example.js', '47;"', 'v'],
      ['b', 'example.js', '48;"', 'v'],
      ['c', 'example.js', '49;"', 'v'],
      ['d', 'example.js', '50;"', 'v'],
      ['WOOT', 'example.js', '56;"', 'v'],
      ['Bar', 'example.js', '55;"', 'f'],
      ['YAAAAY', 'example.js', '60;"', 'v'],
      ['spam', 'example.js', '64;"', 'v'],
    ]
    expect(results).toEqual(expected_results)
  })
})
