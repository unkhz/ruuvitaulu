const fs = require('fs')
const path = require('path')

const tags = new Map()
const labelNames = new Set()

const tagsPath = path.resolve(__dirname, '../../tags.json')

const createTag = ({ isKnown = false, calibration, ...labelsFromConfig }) => ({
  id: labelsFromConfig.id,
  isKnown,
  calibration,
  labels: Array.from(labelNames).map(
    (labelName) => labelsFromConfig[labelName]
  ),
})

const updateTags = () => {
  try {
    let tagConfigs = []
    try {
      tagConfigs = JSON.parse(fs.readFileSync(tagsPath).toString())
    } catch (err) {
      console.error('Failed importing tags.json', err)
    }

    labelNames.clear()
    for (const tagConfig of tagConfigs) {
      const {
        // Omit known metric names from labels
        temperature_calibration,
        humidity_calibration,
        pressure_calibration,
        ...labels
      } = tagConfig
      for (const labelName of Object.keys(labels)) {
        labelNames.add(labelName)
      }
    }

    for (const tagConfig of tagConfigs) {
      tags.set(tagConfig.id, createTag({ ...tagConfig, isKnown: true }))
    }
  } catch (err) {
    console.error(err)
  }
}
updateTags()
setInterval(updateTags, 5000)

const getTag = (id, data) => {
  const tag = tags.get(id) || createTag({ id })
  tags.set(id, { ...tag, id })
  return tag
}

module.exports = {
  getTag,
  getLabelNames: () => Array.from(labelNames),
}
