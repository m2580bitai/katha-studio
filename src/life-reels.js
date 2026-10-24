/** Featured comic-style reels (new pipeline). */
export const featuredReels = [
  {
    id: "reel-tu-late-nahi",
    title: "Tu Late Nahi Hai",
    theme: "Motivation · consistency",
    poster: "images/panel-chotu-2.png",
    video: "reels/reel-tu-late-nahi.mp4",
    downloadName: "Katha-Motivation-Tu-Late-Nahi.mp4",
    end: "Apni race chalao. Tu late nahi hai.",
    caption: "Motivating Hindi reel — comic panels, full animation, clear voice. #Motivation #HindiReels",
    featured: true,
  },
];

/** Legacy life-story reels (older pipeline). */
export const lifeReels = [
  ...featuredReels,
  {
    id: "life-last-seen",
    title: "The Last Seen",
    theme: "Friendship · archive",
    poster: "images/panel-sana-1.png",
    video: "reels/life/life-last-seen.mp4",
    downloadName: "Katha-Life-The-Last-Seen.mp4",
    end: "Call a friend today.",
    caption: "Life story reel",
    featured: false,
  },
];

export function lifeReelById(id) {
  return lifeReels.find((r) => r.id === id) || null;
}
