import { useState, useEffect, useCallback } from 'react';

const FAVORITES_STORAGE_KEY = 'userFavorites';

interface UseFavoritesReturn {
  favoriteIds: string[];
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void; // Added for convenience
}

export const useFavorites = (): UseFavoritesReturn => {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (storedFavorites) {
        setFavoriteIds(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error("Error loading favorites from localStorage:", error);
      setFavoriteIds([]); // Fallback to empty array on error
    }
  }, []);

  const updateLocalStorage = useCallback((ids: string[]) => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(ids));
    } catch (error) {
      console.error("Error saving favorites to localStorage:", error);
    }
  }, []);

  const addFavorite = useCallback((id: string) => {
    setFavoriteIds(prevIds => {
      if (prevIds.includes(id)) {
        return prevIds;
      }
      const newIds = [...prevIds, id];
      updateLocalStorage(newIds);
      return newIds;
    });
  }, [updateLocalStorage]);

  const removeFavorite = useCallback((id: string) => {
    setFavoriteIds(prevIds => {
      const newIds = prevIds.filter(favId => favId !== id);
      updateLocalStorage(newIds);
      return newIds;
    });
  }, [updateLocalStorage]);

  const isFavorite = useCallback((id: string): boolean => {
    return favoriteIds.includes(id);
  }, [favoriteIds]);

  const toggleFavorite = useCallback((id: string) => {
    if (isFavorite(id)) {
      removeFavorite(id);
    } else {
      addFavorite(id);
    }
  }, [isFavorite, addFavorite, removeFavorite]);

  return { favoriteIds, addFavorite, removeFavorite, isFavorite, toggleFavorite };
};

export default useFavorites;
