import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Trash2, Film, Tv } from 'lucide-react';
import { Link } from 'react-router-dom'; // For linking to content detail

// Define a type for downloaded items for clarity
interface DownloadedItem {
  id: string;
  title: string;
  image: string;
  type: 'movie' | 'series' | 'anime' | string; // Allow string for flexibility
  // Add other relevant fields like year, etc., if needed for display
}

// Mock data for downloaded items (replace with actual logic later)
const initialMockDownloads: DownloadedItem[] = [
  {
    id: '101',
    title: 'Inception',
    image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=500&q=80',
    type: 'movie',
  },
  {
    id: '201',
    title: 'Breaking Bad',
    image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=500&q=80',
    type: 'series',
  },
  {
    id: '301',
    title: 'Attack on Titan',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=500&q=80',
    type: 'anime',
  },
  {
    id: '102',
    title: 'The Matrix',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=500&q=80',
    type: 'movie',
  },
];

const DownloadsPage: React.FC = () => {
  const [downloadedItems, setDownloadedItems] = useState<DownloadedItem[]>([]);

  // Load initial mock data or from localStorage
  useEffect(() => {
    // For now, just use initial mock data.
    // Later, this could load from localStorage or a user-specific store.
    setDownloadedItems(initialMockDownloads);
  }, []);

  const handleRemoveDownload = (itemId: string) => {
    setDownloadedItems(prevItems => prevItems.filter(item => item.id !== itemId));
    // If using localStorage, update it here:
    // const updatedItems = downloadedItems.filter(item => item.id !== itemId);
    // localStorage.setItem('downloadedItems', JSON.stringify(updatedItems));
    // toast.success("Removed from downloads"); // Optional: Add toast notification
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 pt-24">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">My Downloads</h1>

        {downloadedItems.length === 0 ? (
          <div className="text-center py-12">
            <img src="/icons/empty-folder.svg" alt="No downloads" className="w-32 h-32 mx-auto mb-6 text-gray-500" />
            <h2 className="text-xl font-semibold mb-2">No Downloads Yet</h2>
            <p className="text-gray-400 mb-6">
              Content you download will appear here. Start exploring and download your favorites!
            </p>
            <Button onClick={() => window.location.href = '/'}>Explore Content</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {downloadedItems.map(item => (
              <div key={item.id} className="bg-card rounded-lg overflow-hidden shadow-lg relative group">
                <Link to={`/content/${item.id}`} className="block">
                  <img
                    src={item.image || '/placeholder.svg'}
                    alt={item.title}
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </Link>
                <div className="p-4">
                  <Link to={`/content/${item.id}`} className="block">
                    <h3 className="text-lg font-semibold mb-1 truncate group-hover:text-cinemax-500 transition-colors">
                      {item.title}
                    </h3>
                  </Link>
                  <div className="flex items-center text-sm text-gray-400 mb-3">
                    {item.type === 'movie' ? <Film className="w-4 h-4 mr-1 flex-shrink-0" /> : <Tv className="w-4 h-4 mr-1 flex-shrink-0" />}
                    <span className="capitalize">{item.type}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-red-500/50 text-red-500 hover:bg-red-500/10 hover:text-red-400 group"
                    onClick={() => handleRemoveDownload(item.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2 group-hover:text-red-400" />
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default DownloadsPage;
