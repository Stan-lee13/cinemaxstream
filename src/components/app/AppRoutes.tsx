import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import LoadingState from "@/components/LoadingState";

// Critical components (load immediately)
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";

// Lazy loaded components
const ContentDetail = lazy(() => import("@/pages/ContentDetail"));
const Category = lazy(() => import("@/pages/Category"));
const Favorites = lazy(() => import("@/pages/Favorites"));
const Downloads = lazy(() => import("@/pages/Downloads"));
const UserProfile = lazy(() => import("@/pages/UserProfile"));
const Account = lazy(() => import("@/pages/Account"));
const WatchHistory = lazy(() => import("@/pages/WatchHistory"));
const Contact = lazy(() => import("@/pages/Contact"));
const ContactSupport = lazy(() => import("@/pages/ContactSupport"));
const ExportData = lazy(() => import("@/pages/ExportData"));
const DeleteAccount = lazy(() => import("@/pages/DeleteAccount"));
const Terms = lazy(() => import("@/pages/Terms"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const FAQ = lazy(() => import("@/pages/FAQ"));
const HelpCenter = lazy(() => import("@/pages/HelpCenter"));
const OnboardingLanding = lazy(() => import("@/pages/OnboardingLanding"));
const OnboardingAuth = lazy(() => import("@/pages/OnboardingAuth"));
const ModernResetPassword = lazy(() => import("@/pages/ModernResetPassword"));
const PasswordUpdate = lazy(() => import("@/pages/PasswordUpdate"));
const Settings = lazy(() => import("@/pages/Settings"));
const EditProfile = lazy(() => import("@/pages/EditProfile"));
const ManageBillingPage = lazy(() => import("@/pages/ManageBillingPage"));
const NotificationSettings = lazy(() => import("@/pages/NotificationSettings"));
const SecuritySettings = lazy(() => import("@/pages/SecuritySettings"));
const NewReleases = lazy(() => import("@/pages/NewReleases"));
const TopRated = lazy(() => import("@/pages/TopRated"));
const WatchList = lazy(() => import("@/pages/WatchList"));
const DMCA = lazy(() => import("@/pages/DMCA"));
const Cookies = lazy(() => import("@/pages/Cookies"));
const Legal = lazy(() => import("@/pages/Legal"));
const Admin = lazy(() => import("@/pages/Admin"));
const AppSettings = lazy(() => import("@/pages/AppSettings"));
const TierTest = lazy(() => import("@/pages/TierTest")); // Add TierTest route

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingState />}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/home" element={<Index />} />
        <Route path="/content/:id" element={<ContentDetail />} />
        <Route path="/movies" element={<Category />} />
        <Route path="/series" element={<Category />} />
        <Route path="/anime" element={<Category />} />
        <Route path="/documentary" element={<Category />} />
        <Route path="/sports" element={<Category />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/watchlist" element={<WatchList />} />
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
        <Route path="/settings" element={<Settings />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/manage-billing" element={<ManageBillingPage />} />
        <Route path="/notification-settings" element={<NotificationSettings />} />
        <Route path="/security-settings" element={<SecuritySettings />} />
        <Route path="/new-releases" element={<NewReleases />} />
        <Route path="/top-rated" element={<TopRated />} />
        <Route path="/dmca" element={<DMCA />} />
        <Route path="/cookies" element={<Cookies />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/help-center" element={<HelpCenter />} />
        <Route path="/contact-support" element={<ContactSupport />} />
        <Route path="/export-data" element={<ExportData />} />
        <Route path="/delete-account" element={<DeleteAccount />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/app-settings" element={<AppSettings />} />
        <Route path="/tier-test" element={<TierTest />} /> {/* Add TierTest route */}
        <Route path="/similar/:category" element={<Category />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;