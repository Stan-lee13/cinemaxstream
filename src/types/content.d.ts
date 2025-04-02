
interface ContentItem {
  id: string;
  title: string;
  description: string;
  image: string;
  poster?: string;
  backdrop?: string;
  year: string;
  duration: string;
  rating: string;
  category: string;
  type?: string;
}

interface Content {
  id: string; // Changed from number to string
  title: string;
  image: string;
  poster?: string;
  backdrop?: string;
  year?: string;
  rating?: string;
  category?: string;
  type?: string;
  description?: string;
  duration?: string;
}

interface FeaturedContent {
  id: string; // Changed from number to string
  title: string;
  description: string;
  image: string;
  category: string;
  year: string;
  duration: string;
  rating: string;
}
