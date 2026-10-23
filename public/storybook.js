'use strict';

// A shared, local artwork catalog keeps the board and deed collection in sync.
// Each world has its own illustrations; every property uses a distinct scene.
(() => {
  const names = Object.freeze({
    '0-1': 'copper-lane', '0-3': 'richmond-place',
    '0-5': 'cherokee-village', '0-7': 'sterling-creek',
    '0-9': 'turtle-landing', '0-11': 'buckhead',
    '0-13': 'richmond-hill-plantation', '0-15': 'ford-plantation',
    '1-1': 'richmond-heights', '1-3': 'creekside',
    '1-5': 'buckhead-east', '1-7': 'heartwood',
    '1-9': 'dunham-marsh', '1-11': 'wexford', '1-13': 'magnolia-hill',
    '2-1': 'watergrass', '2-3': 'belfast-oaks',
    '2-5': 'kilkenny-point', '2-7': 'cape-hardwicke',
    '2-9': 'waterford-landing', '2-11': 'the-bluffs', '2-13': 'waterways'
  });
  const worlds = Object.freeze([
    Object.freeze({directory:'richmond',centerArt:'/art/richmond/marsh.svg',subtitle:'LIVE OAKS · SALT MARSH · HOME'}),
    Object.freeze({directory:'communities',centerArt:'/art/communities/commons.svg',subtitle:'GARDEN PATHS · GATHERING PLACES · HOME'}),
    Object.freeze({directory:'coastal',centerArt:'/art/coastal/estuary.svg',subtitle:'SEA BREEZES · TIDAL WATERS · HOME'})
  ]);
  window.MiniopolyVisuals = Object.freeze({
    upgradeStar: '/art/icons/upgrade-star.png',
    propertyArt(id) {
      return Object.hasOwn(names,id) ? '/art/'+worlds[Number(id[0])].directory+'/neighborhoods.svg#'+names[id] : '';
    },
    worldScenery(index) {
      return Number.isInteger(index) ? worlds[index]||null : null;
    }
  });
})();
