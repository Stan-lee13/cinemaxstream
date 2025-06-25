
import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import ContentDetail from "@/pages/ContentDetail";
import Category from "@/pages/Category";
import Favorites from "@/pages/Favorites";
import Downloads from "@/pages/Downloads";
import UserProfile from "@/pages/UserProfile";
import Account from "@/pages/Account";
import WatchHistory from "@/pages/WatchHistory";
import Contact from "@/pages/Contact";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import FAQ from "@/pages/FAQ";
import HelpCenter from "@/pages/HelpCenter";
import NotFound from "@/pages/NotFound";
import OnboardingLanding from "@/pages/OnboardingLanding";
import OnboardingAuth from "@/pages/OnboardingAuth";
import ModernResetPassword from "@/pages/ModernResetPassword";
import PasswordUpdate from "@/pages/PasswordUpdate";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/content/:id" element={<ContentDetail />} />
      <Route path="/movies" element={<Category />} />
      <Route path="/series" element={<Category />} />
      <Route path="/anime" element={<Category />} />
      <Route path="/documentary" element={<Category />} />
      <Route path="/sports" element={<Category />} />
      <Route path="/favorites" element={<Favorites />} />
      <Route path="/downloads" element={<Downloads />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/account" element={<Account />} />
      <Route path="/history" element={<WatchHistory />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/help" element={<HelpCenter />} />
      <Route path="/onboarding" element={<OnboardingLanding />} />
      <Route path="/auth" element={<OnboardingAuth />} />
      <Route path="/reset-password" element={<ModernResetPassword />} />
      <Route path="/update-password" element={<PasswordUpdate />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
