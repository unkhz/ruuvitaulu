const fs = require('fs')
const path = require('path')

const tags = new Map()

const tagsPath = path.resolve(__dirname, '../../tags.json')

const createTag = ({ id, isKnown = false, ...labels }) => ({
  id,
  isKnown,
  ...labels,
})

const updateTags = () => {
  try {
    const tagConfigs = JSON.parse(fs.readFileSync(tagsPath).toString())
    for (const tagConfig of tagConfigs) {
      tags.set(tagConfig.id, createTag({ ...tagConfig, isKnown: true }))
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
  const labels = labelNames.map((labelName) => tag[labelName])
  return labels
}

const getLabelNames = () => {
  const labelNames = new Set()
  for (const tag of tags.values()) {
    for (const labelName of Object.keys(tag)) {
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
