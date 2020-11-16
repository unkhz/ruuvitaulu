const fs = require('fs')
const path = require('path')

const tags = new Map()
const labelNames = new Set()

const tagsPath = path.resolve(__dirname, '../../tags.json')

const createTag = ({ isKnown = false, ...labelsFromConfig }) => ({
  id: labelsFromConfig.id,
  isKnown,
  labels: Array.from(labelNames).map(
    (labelName) => labelsFromConfig[labelName]
  ),
})

const updateTags = () => {
  try {
    const tagConfigs = JSON.parse(fs.readFileSync(tagsPath).toString())

    labelNames.clear()
    for (const tagConfig of tagConfigs) {
      for (const labelName of Object.keys(tagConfig)) {
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
