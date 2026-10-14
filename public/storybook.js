'use strict';

// A shared, local artwork catalog keeps the board and deed collection in sync.
// Only Richmond Hill receives this first visual release.
(() => {
  const names = Object.freeze({
    '0-1': 'copper-lane', '0-3': 'richmond-place',
    '0-5': 'cherokee-village', '0-7': 'sterling-creek',
    '0-9': 'turtle-landing', '0-11': 'buckhead',
    '0-13': 'richmond-hill-plantation', '0-15': 'ford-plantation'
  });
  window.MiniopolyVisuals = Object.freeze({
    upgradeStar: '/art/icons/upgrade-star.png',
    propertyArt(id) {
      return names[id] ? '/art/richmond/neighborhoods.svg#' + names[id] : '';
    }
  });
})();
