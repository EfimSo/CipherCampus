#!/usr/bin/env node
/**
 * generateProverToml.js
 *
 * Usage:
 *   node generateProverToml.js inputs.json Prover.toml
 *
 * Where `inputs.json` is a file like:
 * {
 *   "studentId": "U93472293",
 *   "leafIndex": "1234",
 *   "path": [
 *     "0xabc123…",
 *     "0xdef456…",
 *     "...",
 *     "0x789abc…"
 *   ],
 *   "collegeIdx": "1",
 *   "deptIdx": "2",
 *   "courseIdx": "3"
 * }
 *
 * And it will produce `Prover.toml`:
 *   student_id = "U93472293"
 *   leaf_index = "1234"
 *   path = ["0xabc123…", "0xdef456…", "...", "0x789abc…"]
 *   college_idx = "1"
 *   dept_idx = "2"
 *   course_idx = "3"
 */

const fs = require('fs')
const [ , , inputJson, outputToml ] = process.argv

if (!inputJson || !outputToml) {
  console.error('Usage: node generateProverToml.js <inputs.json> <Prover.toml>')
  process.exit(1)
}

let data
try {
  data = JSON.parse(fs.readFileSync(inputJson, 'utf8'))
} catch (e) {
  console.error(`Failed to read or parse ${inputJson}:`, e.message)
  process.exit(2)
}

const {
  studentId,
  leafIndex,
  path,
  collegeIdx,
  deptIdx,
  courseIdx
} = data

if (
  studentId == null ||
  leafIndex == null ||
  !Array.isArray(path) ||
  collegeIdx == null ||
  deptIdx == null ||
  courseIdx == null
) {
  console.error(`inputs.json must include:
  - studentId (string)
  - leafIndex (string or number)
  - path (array of field-hex strings)
  - collegeIdx, deptIdx, courseIdx (string or number)`)
  process.exit(3)
}

const tomlLines = []

tomlLines.push(`student_id = "${studentId}"`)
tomlLines.push(`leaf_index = "${leafIndex}"`)

// simple array of field values:
tomlLines.push(`path = [ ${path.map(p => `"${p}"`).join(', ')} ]`)

tomlLines.push(`college_idx = "${collegeIdx}"`)
tomlLines.push(`dept_idx    = "${deptIdx}"`)
tomlLines.push(`course_idx  = "${courseIdx}"`)

fs.writeFileSync(outputToml, tomlLines.join('\n') + '\n')

console.log(`✔️  Wrote ${outputToml}`)
