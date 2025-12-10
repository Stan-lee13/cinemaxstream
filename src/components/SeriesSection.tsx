import React from "react";
import { Link } from "react-router-dom";
import { Play, Star, Clock, ImageOff } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { tmdbApi } from "@/services/tmdbApi";
import { Content } from "@/types/content";

const SeriesSection = () => {
  const {
    data: series,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["series-section", "series"],
    queryFn: () => tmdbApi.getContentByCategory("series"),
  });

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cinemax-500 to-purple-500 bg-clip-text text-transparent">
            Popular Series
          </h2>
          <p className="text-gray-400 text-lg">
            Binge-watch the most captivating series of the year
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl h-80 animate-pulse" />
            ))}
          </div>
        ) : error || !series || !series.length ? (
          <div className="text-center text-gray-500">No popular series found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {series.slice(0, 6).map((show) => (
              <Link
                key={show.id}
                to={`/content/${show.id}`}
                className="group bg-card rounded-xl overflow-hidden border border-gray-800 hover:border-cinemax-500 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <div className="relative">
                  <div className="relative h-64 w-full overflow-hidden">
                    {show.image ? (
                      <img
                        src={show.image}
                        alt={show.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : null}
                    {!show.image && (
                      <div className="flex flex-col items-center justify-center h-full w-full bg-gray-950/90">
                        <ImageOff size={42} className="mx-auto text-gray-600" />
                        <span className="text-xs mt-1 text-gray-500">Image unavailable</span>
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white">
                        <Play className="w-5 h-5" />
                        <span className="text-sm font-medium">Watch Now</span>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-medium">{show.rating || "—"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-white group-hover:text-cinemax-400 transition-colors">
                      {show.title || "Untitled"}
                    </h3>
                    <span className="text-cinemax-400 font-medium">{show.year || "—"}</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {show.description || "No description available."}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-4 text-sm text-gray-300">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          {show.duration ? show.duration : "—"}
                        </span>
                      </div>
                      {show.category && <><span>•</span><span>{show.category}</span></>}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            to="/series"
            className="inline-flex items-center gap-2 bg-cinemax-500 hover:bg-cinemax-600 text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            View All Series
            <Play className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SeriesSection;
