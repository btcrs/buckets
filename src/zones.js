import filter from 'lodash.filter'
import map from 'lodash.map'

const restricted = 4
const freeThrowLine = 13.75
const paint = 16
const cornerThreeX = 22
const cornerThreeY = 8.75
const three = 23.75

const zones = [{
  name: 'restricted area',
  contains: ({
      d
    }) =>
    d <= restricted,
}, {
  name: 'low post',
  contains: ({
      x,
      y,
      d
    }) =>
    d > restricted &&
    y <= (freeThrowLine / 2) &&
    Math.abs(x) <= (paint / 2),
}, {
  name: 'high post',
  contains: ({
      x,
      y
    }) =>
    y > (freeThrowLine / 2) &&
    y < freeThrowLine &&
    Math.abs(x) <= (paint / 2),
}, {
  name: 'midrange (lower right)',
  contains: ({
      x,
      y
    }) =>
    x >= -cornerThreeX &&
    x < -(paint / 2) &&
    y < cornerThreeY,
}, {
  name: 'midrange (lower left)',
  contains: ({
      x,
      y
    }) =>
    x > (paint / 2) &&
    x <= cornerThreeX &&
    y < cornerThreeY,
}, {
  name: 'midrange (upper right)',
  contains: ({
      x,
      y,
      d
    }) =>
    x >= -cornerThreeX &&
    x < -(paint / 2) &&
    y >= cornerThreeY &&
    d <= three,
}, {
  name: 'midrange (upper left)',
  contains: ({
      x,
      y,
      d
    }) =>
    x > (paint / 2) &&
    x <= cornerThreeX &&
    y >= cornerThreeY &&
    d <= three,
}, {
  name: 'midrange (upper middle)',
  contains: ({
      x,
      y,
      d
    }) =>
    Math.abs(x) <= paint &&
    y > freeThrowLine &&
    d <= three,
}, {
  name: 'three (right corner)',
  contains: ({
      x,
      y
    }) =>
    x < -cornerThreeX &&
    y < cornerThreeY,
}, {
  name: 'three (left corner)',
  contains: ({
      x,
      y
    }) =>
    x > cornerThreeX &&
    y < cornerThreeY,
}, {
  name: 'three (right)',
  contains: ({
      x,
      y,
      d
    }) =>
    d > three &&
    x < -paint &&
    y > cornerThreeY,
}, {
  name: 'three (middle)',
  contains: ({
      x,
      y,
      d
    }) =>
    d > three &&
    Math.abs(x) <= paint &&
    y > cornerThreeY,
}, {
  name: 'three (left)',
  contains: ({
      x,
      y,
      d
    }) =>
    d > three &&
    x > paint &&
    y > cornerThreeY,
}]

function dist(x, y) {
  return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)).toFixed(2)
}

function getZones() {
  return map(zones, 'name')
}

function getZoneFromShot({
  x,
  y
}) {
  const d = dist(x, y)
  const zone = filter(zones, z => z.contains({
      x,
      y,
      d
    }))
    .shift()
  return zone ? zone.name : null
}

module.exports = getZoneFromShot
