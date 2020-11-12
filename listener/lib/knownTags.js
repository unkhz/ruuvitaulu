const fs = require('fs')
const path = require('path')

const tags = new Map()

const tagsPath = path.resolve(__dirname, '../../tags.json')

const createTag = ({ id, name, labels }) => ({
  id,
  isKnown: name && name !== id,
  name: name || id,
  labels: labels || {},
})

const updateTags = () => {
  try {
    const tagConfigs = JSON.parse(fs.readFileSync(tagsPath).toString())
    for (const tagConfig of tagConfigs) {
      tags.set(tagConfig.id, createTag(tagConfig))
    }
  } catch (err) {
    console.error(err)
  }
}
updateTags()
setInterval(updateTags, 5000)

const getTag = ({ id }) => {
  const tag = tags.get(id) || createTag({ id })
  tags.set(tag.id, tag)
  return tag
}

const getTagLabels = (partialTag) => {
  const tag = getTag(partialTag)
  const labelNames = getLabelNames()
  const labels = labelNames.map(
    (labelName) => tag.labels[labelName] || tag[labelName]
  )
  return labels
}

const getLabelNames = () => {
  const labelNames = new Set(['id', 'name'])
  for (const tag of tags.values()) {
    for (const labelName of Object.keys(tag.labels)) {
      labelNames.add(labelName)
    }
  }
  return Array.from(labelNames)
}

module.exports = {
  getTag,
  getTagLabels,
  getLabelNames,
}
