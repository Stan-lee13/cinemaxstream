
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface ContentRowHeaderProps {
  title: string;
  showViewAll?: boolean;
  viewAllLink: string;
}

const ContentRowHeader: React.FC<ContentRowHeaderProps> = ({
  title,
  showViewAll,
  viewAllLink,
}) => (
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
    {showViewAll && (
      <Link
        to={viewAllLink}
        className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
      >
        <span>View All</span>
        <ArrowRight size={16} />
      </Link>
    )}
  </div>
);

export default ContentRowHeader;
