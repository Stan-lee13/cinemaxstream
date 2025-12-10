
import React from "react";
import { Trophy, Film, Globe2 } from "lucide-react";

interface CategoryBannerProps {
  category: "sports" | "documentary";
}

const iconMap = {
  sports: <Trophy className="w-7 h-7 mr-2 text-amber-400" />,
  documentary: <Globe2 className="w-7 h-7 mr-2 text-blue-400" />,
};

const labelMap = {
  sports: "Sports Picks",
  documentary: "Documentaries",
};

const colorMap = {
  sports: "bg-gradient-to-r from-amber-600/80 to-yellow-400/60 text-amber-50",
  documentary: "bg-gradient-to-r from-blue-800/80 to-blue-400/80 text-blue-50",
};

const CategoryBanner: React.FC<CategoryBannerProps> = ({ category }) => (
  <div className={`flex items-center px-6 py-3 rounded-lg mb-2 mt-3 font-bold shadow-md ${colorMap[category]}`}>
    {iconMap[category]}
    <span className="text-xl tracking-wide">{labelMap[category]}</span>
  </div>
);

export default CategoryBanner;

