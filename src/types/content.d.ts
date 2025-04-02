
interface FeaturedContent {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  year: string;
  duration: string;
  rating: string;
}

interface ContentItem {
  id: string;
  title: string;
  description: string;
  poster: string;
  backdrop: string;
  category: string;
  year: string;
  duration: string;
  rating: string;
}

type Content = ContentItem;
