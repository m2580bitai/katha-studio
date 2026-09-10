import { monsoonMeera } from "./books/monsoon-meera.js";
import { nightMail } from "./books/night-mail.js";
import { goldenAuto } from "./books/golden-auto.js";
import { tenShadows } from "./books/ten-shadows.js";
import { wrestlersPromise } from "./books/wrestlers-promise.js";
import { stepwellClock } from "./books/stepwell-clock.js";
import { walkingGhazals } from "./books/walking-ghazals.js";
import { solarGoat } from "./books/solar-goat.js";
import { tiffinMap } from "./books/tiffin-map.js";
import { netOfLights } from "./books/net-of-lights.js";

export const studio = {
  name: "Katha Studio",
  tagline: "Original Indian comics that move.",
  blurb:
    "Ten original graphic books — twenty-two pages each — from Kerala rain to Ladakh sun. Read them animated, watch a short motion trailer, or take the PDF home.",
};

export const characters = [
  {
    id: "meera",
    name: "Meera Rainbinder",
    role: "Listener of clouds",
    place: "Alappuzha backwaters",
    portrait: "/images/char-meera.png",
    bio: "Sixteen, stubborn, and the only person in her village who can hear the monsoon as a conversation. She bargains with weather the way other teenagers bargain for extra mango pickle.",
  },
  {
    id: "amma",
    name: "Amma",
    role: "Keeper of the fourth cup",
    place: "Alappuzha",
    portrait: "/images/char-amma.png",
    bio: "Meera’s mother. She hides worry in extra pickle, believes hospitality is technology, and will scold a cloud if it tracks mud on a freshly swept floor.",
  },
  {
    id: "tara",
    name: "Inspector Tara Sen",
    role: "Night-mail detective",
    place: "Howrah Junction",
    portrait: "/images/char-tara.png",
    bio: "A Kolkata investigator who treats missing letters like missing people. She carries a brass lantern because some evidence only shows up in old light.",
  },
  {
    id: "chotu",
    name: "Chotu Malik",
    role: "Courier of lost things",
    place: "Chandni Chowk",
    portrait: "/images/char-chotu.png",
    bio: "Twelve, goggles always on the forehead, best friends with a golden auto-rickshaw that should not be able to fly — and absolutely does.",
  },
  {
    id: "sonu",
    name: "Sonu the Auto",
    role: "Illegal altitude",
    place: "Old Delhi",
    portrait: "/images/char-sonu.png",
    bio: "A talking golden auto assembled by a mechanic who believed in folklore. Eats marigolds, insults SUVs, and keeps secrets at height.",
  },
  {
    id: "priya",
    name: "Priya Rao",
    role: "Field archaeologist",
    place: "Hampi",
    portrait: "/images/char-priya.png",
    bio: "She would rather argue with a thousand-year-old shadow than with a museum board. Relics, in her view, are not loot. They are unfinished sentences.",
  },
  {
    id: "raja",
    name: "Raja Pahalwan",
    role: "Akhara wrestler",
    place: "Amritsar outskirts",
    portrait: "/images/char-raja.png",
    bio: "Strong enough to throw a pride-demon, stubborn enough to refuse a pile of trophies. The mud remembers who he bowed to.",
  },
  {
    id: "guruji",
    name: "Guru-ji",
    role: "Map-handed teacher",
    place: "Amritsar akhara",
    portrait: "/images/char-guruji.png",
    bio: "Raja’s guru. Speaks in refusals and four a.m. trainings. His hands are maps of every throw he ever taught, including the ones he wishes he had refused faster.",
  },
  {
    id: "vikram",
    name: "Vikram Adalaj",
    role: "Intern of appointments",
    place: "Adalaj stepwell",
    portrait: "/images/char-vikram.png",
    bio: "Fourteen, unofficial keeper of a brass clock that ticks backwards when the wrong century tries to queue-jump. Usher of festivals that refuse to wait their turn.",
  },
  {
    id: "sana",
    name: "Sana Qureshi",
    role: "Shepherd of ghazals",
    place: "Lucknow",
    portrait: "/images/char-sana.png",
    bio: "Nineteen. When songs stand up and leave their singers, she follows them through chowks — then teaches them to sit, and to refuse being sold as luxury silence.",
  },
  {
    id: "tashi",
    name: "Tashi Dolma",
    role: "Mechanic of leftover sun",
    place: "Nubra Valley",
    portrait: "/images/char-tashi.png",
    bio: "Seventeen, Ladakhi tinkerer. Builds solar saddles, teaches other hands to solder, and cites her goat Kalsang as co-author of every working circuit.",
  },
  {
    id: "leela",
    name: "Leela Kulkarni",
    role: "Courier of unprofitable care",
    place: "Pune",
    portrait: "/images/char-leela.png",
    bio: "Cycle courier in yellow. Found a tiffin that maps a city’s secret kindnesses. Collects detours the algorithm wants to flatten.",
  },
  {
    id: "bommi",
    name: "Bommi Selvam",
    role: "Hauler of other people’s glitter",
    place: "Chennai coast",
    portrait: "/images/char-bommi.png",
    bio: "Fisherwoman who once netted stolen city light. Returns bulbs to the doorways they remember, and mends spare nets from copper and old saris.",
  },
];

export const comics = [
  monsoonMeera,
  nightMail,
  goldenAuto,
  tenShadows,
  wrestlersPromise,
  stepwellClock,
  walkingGhazals,
  solarGoat,
  tiffinMap,
  netOfLights,
];

export function comicById(id) {
  return comics.find((c) => c.id === id);
}

export function comicVideo(comic) {
  return `/videos/${comic.id}.mp4`;
}
