
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import ContentDetail from '@/pages/ContentDetail';
import Auth from '@/pages/Auth';
import ResetPassword from '@/pages/ResetPassword';
import UserProfile from '@/pages/UserProfile';
import WatchHistory from '@/pages/WatchHistory';
import Category from '@/pages/Category';
import NotFound from '@/pages/NotFound';
import FAQ from '@/pages/FAQ';
import HelpCenter from '@/pages/HelpCenter';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import Contact from '@/pages/Contact';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/content/:id" element={<ContentDetail />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/history" element={<WatchHistory />} />
      <Route path="/movies" element={<Category title="Movies" categoryType="movie" />} />
      <Route path="/series" element={<Category title="TV Series" categoryType="series" />} />
      <Route path="/anime" element={<Category title="Anime" categoryType="anime" />} />
      <Route path="/category/:slug" element={<Category />} />
      
      {/* New pages */}
      <Route path="/faq" element={<FAQ />} />
      <Route path="/help-center" element={<HelpCenter />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/contact" element={<Contact />} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
