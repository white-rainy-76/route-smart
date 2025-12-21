/**
 * Script to export translations to CSV for translators
 * Usage: node src/scripts/export-translations.js
 */

const fs = require('fs')
const path = require('path')

// Read master language file
const en = require('../i18n/translations/en.json')

// Flatten the nested structure for translators
function flattenObject(obj, prefix = '') {
  return Object.keys(obj).reduce((acc, k) => {
    const pre = prefix.length ? `${prefix}.` : ''
    if (
      typeof obj[k] === 'object' &&
      obj[k] !== null &&
      !Array.isArray(obj[k])
    ) {
      Object.assign(acc, flattenObject(obj[k], `${pre}${k}`))
    } else {
      acc[`${pre}${k}`] = obj[k]
    }
    return acc
  }, {})
}

// Create a CSV for translators
const flatten = flattenObject(en)
let csv = 'key,en\n'
Object.keys(flatten).forEach((key) => {
  const value = String(flatten[key]).replace(/"/g, '""')
  csv += `"${key}","${value}"\n`
})

const outputPath = path.join(__dirname, '../../translations.csv')
fs.writeFileSync(outputPath, csv, 'utf8')

console.log(`✅ Translations exported to ${outputPath}`)
console.log(`📊 Total keys: ${Object.keys(flatten).length}`)
