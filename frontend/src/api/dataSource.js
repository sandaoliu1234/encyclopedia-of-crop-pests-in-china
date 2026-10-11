const BASE = '/data'

let speciesIndex = null
let cropPestMap = null
let pestDistribution = null

export async function loadSpeciesIndex() {
  if (!speciesIndex) {
    const res = await fetch(`${BASE}/index.json`)
    speciesIndex = await res.json()
  }
  return speciesIndex
}

export async function loadCropPestMap() {
  if (!cropPestMap) {
    const res = await fetch(`${BASE}/crop-pest.json`)
    cropPestMap = await res.json()
  }
  return cropPestMap
}

export async function loadPestDistribution() {
  if (!pestDistribution) {
    const res = await fetch(`${BASE}/map/pest-distribution.json`)
    pestDistribution = await res.json()
  }
  return pestDistribution
}

export async function getSpeciesById(id) {
  const index = await loadSpeciesIndex()
  return index.find(s => s.id === Number(id))
}

export async function getCrops() {
  const index = await loadSpeciesIndex()
  return index.filter(s => s.type === 'crop')
}

export async function getPests() {
  const index = await loadSpeciesIndex()
  return index.filter(s => s.type === 'pest')
}

export async function getPestsForCrop(cropId) {
  const map = await loadCropPestMap()
  const links = map[String(cropId)] || []
  const index = await loadSpeciesIndex()
  return links.map(link => {
    const pest = index.find(s => s.id === link.pestId)
    return { ...pest, ...link }
  })
}

export async function getDistributionForPest(pestId) {
  const dist = await loadPestDistribution()
  return dist[String(pestId)] || []
}

export async function loadGeoJSON(adcode = 100000) {
  const res = await fetch(`/geo/${adcode}.json`)
  return res.json()
}
