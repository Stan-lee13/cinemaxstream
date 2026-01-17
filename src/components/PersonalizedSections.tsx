/**
 * Personalized Sections Component
 * 
 * This component is deprecated - functionality moved to Index.tsx
 * Keeping for backward compatibility
 */

import React, { memo } from "react";
import ContinueWatching from "./ContinueWatching";

const PersonalizedSections: React.FC = memo(() => {
  return <ContinueWatching />;
});

PersonalizedSections.displayName = 'PersonalizedSections';

export default PersonalizedSections;