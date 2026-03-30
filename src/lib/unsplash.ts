// Curated hospitality-themed Unsplash photos (no API key needed)
export const UNSPLASH = {
  // Hero / general
  hero: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80", // elegant restaurant interior
  
  // Role cards
  restaurant: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80", // restaurant dining
  supplier: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80", // warehouse / supply
  jobseeker: "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=800&q=80", // chef at work

  // Featured section
  featured: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80", // fine dining plated food

  // Rotating images for directory cards
  directory: [
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80", // restaurant bar
    "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80", // hotel lobby
    "https://images.unsplash.com/photo-1571805529673-0f56b922b359?w=600&q=80", // commercial kitchen
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80", // food plating
    "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=600&q=80", // cafe interior
    "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=600&q=80", // restaurant ambiance
  ],

  // Blog thumbnails
  blog: [
    "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&q=80", // cooking
    "https://images.unsplash.com/photo-1428515613728-6b4607e44363?w=600&q=80", // kitchen prep
    "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600&q=80", // team in kitchen
    "https://images.unsplash.com/photo-1560053608-13721e0d69e5?w=600&q=80", // restaurant exterior
  ],
};

/** Pick a deterministic image from an array based on a string id */
export function pickImage(images: string[], id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  }
  return images[Math.abs(hash) % images.length];
}
