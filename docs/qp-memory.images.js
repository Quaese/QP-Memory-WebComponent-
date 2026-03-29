// public/js/components-web/qp-memory/qp-memory.images.js

const base = import.meta.url;
const resolve = (path) => new URL(path, base).href;

const images = {
  // Zodiac signs
  pisces: resolve('./images/pisces.svg'),
  aries: resolve('./images/aries.svg'),
  taurus: resolve('./images/taurus.svg'),
  gemini: resolve('./images/gemini.svg'),
  cancer: resolve('./images/cancer.svg'),
  leo: resolve('./images/leo.svg'),
  virgo: resolve('./images/virgo.svg'),
  libra: resolve('./images/libra.svg'),
  scorpio: resolve('./images/scorpio.svg'),
  sagittarius: resolve('./images/sagittarius.svg'),
  capricorn: resolve('./images/capricorn.svg'),
  aquarius: resolve('./images/aquarius.svg'),

  // Traffic signs
  rightOfWay: resolve('./images/right-of-way.svg'),
  construction: resolve('./images/construction.svg'),
  greenArrow: resolve('./images/green-arrow.svg'),
  yield: resolve('./images/yield.svg'),
  stop: resolve('./images/stop.svg'),
  playStreet: resolve('./images/play-street.svg'),
  pedestrianBikePath: resolve('./images/pedestrian-bike-path.svg'),

  // Misc
  musicNote: resolve('./images/music-note.svg'),
  musicNotes: resolve('./images/music-notes.svg'),
  footprint01: resolve('./images/footprint_01.svg'),
  footprint02: resolve('./images/footprint_02.svg'),
  butterfly: resolve('./images/butterfly.svg'),
  snowflake: resolve('./images/snowflake.svg'),
  starStroked: resolve('./images/star-stroked.svg'),
  starFilled: resolve('./images/star-filled.svg'),
  starRotated: resolve('./images/star-rotated.svg'),
  starRotatedFilled: resolve('./images/star-rotated-filled.svg'),

  // Playing card suits
  spades: resolve('./images/spades.png'),
  hearts: resolve('./images/hearts.png'),
  diamonds: resolve('./images/diamonds.png'),
  clubs: resolve('./images/clubs.png'),
};

export const imageList = Object.values(images);

export default images;
