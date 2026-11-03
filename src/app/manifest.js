export default function manifest() {
  return {
    name: "CalorieLens — AI Nutrition & Meal Tracker",
    short_name: "CalorieLens",
    description: "Snap or speak your meal for instant calorie tracking, NutriScores, and healthy swaps.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#07090e",
    theme_color: "#10b981",
    categories: ["health", "fitness", "lifestyle", "food"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable any",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
