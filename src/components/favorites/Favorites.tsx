import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Search,
  Filter,
  Code2,
  MessageSquare,
  FolderOpen,
  LayoutGrid,
  List as ListIcon,
} from "lucide-react";
import { useItems } from "@/hooks/useItems";
import { useUIStore } from "@/store/uiStore";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { format } from "date-fns";

export function Favorites() {
  const { data: items, isLoading } = useItems(); // Fetch all items
  const { openModal, initializedViews, markViewInitialized } = useUIStore();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<
    "all" | "code" | "prompt" | "file"
  >("all");

  const hasInitialized = initializedViews.has("favorites");

  React.useEffect(() => {
    if (!hasInitialized) {
      markViewInitialized("favorites");
    }
  }, [hasInitialized, markViewInitialized]);

  // Filter for favorites and other criteria
  const favoriteItems = useMemo(() => {
    if (!items) return [];

    return items.filter((item) => {
      // Must be favorite
      if (!item.isFavorite) return false;

      // Type filter
      if (selectedType !== "all" && item.type !== selectedType) return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.content?.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [items, searchQuery, selectedType]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "code":
        return Code2;
      case "prompt":
        return MessageSquare;
      case "file":
        return FolderOpen;
      default:
        return Star;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "code":
        return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20";
      case "prompt":
        return "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20";
      case "file":
        return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50";
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Favorites</h1>
          <p className="text-muted-foreground mt-1">
            Your collection of starred items across all categories
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl shadow-sm border border-border">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search favorites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-muted/50 border-border"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
            {["all", "code", "prompt", "file", "project"].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type as any)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  selectedType === type
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-border mx-2" />

          <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === "grid"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === "list"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid/List View */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : favoriteItems.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-1">
            No favorites yet
          </h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Star items from your Code Library, AI Prompts, or Files to see them
            here for quick access.
          </p>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          <AnimatePresence mode="popLayout">
            {favoriteItems.map((item) => {
              const TypeIcon = getTypeIcon(item.type);
              const typeColor = getTypeColor(item.type);

              return (
                <motion.div key={item.id} layout>
                  <Card
                    className={`
                      group cursor-pointer hover:shadow-md transition-all border-border hover:border-violet-200 dark:hover:border-violet-800
                      ${viewMode === "list" ? "flex items-center p-4 gap-6" : "h-full flex flex-col"}
                    `}
                    onClick={() =>
                      openModal(
                        item.type === "project" ? "project-view" : "item",
                        item,
                      )
                    }
                  >
                    {/* Card Content based on View Mode */}
                    {viewMode === "grid" ? (
                      <>
                        <div className="p-5 flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div className={`p-2 rounded-lg ${typeColor}`}>
                              <TypeIcon className="w-5 h-5" />
                            </div>
                            <Badge
                              variant="secondary"
                              className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-yellow-100 dark:border-yellow-900/30 gap-1"
                            >
                              <Star className="w-3 h-3 fill-yellow-600 dark:fill-yellow-400" />
                              Favorite
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-foreground mb-2 line-clamp-1 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                            {item.description || "No description provided"}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {item.category && (
                              <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-md">
                                {item.category}
                              </span>
                            )}
                            {item.language && (
                              <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-md">
                                {item.language}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="px-5 py-3 border-t border-border bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            {format(item._creationTime, "MMM d, yyyy")}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className={`p-2 rounded-lg ${typeColor} shrink-0`}>
                          <TypeIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {item.description || "No description provided"}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          {item.category && (
                            <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-md hidden md:inline-block">
                              {item.category}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground w-24 text-right hidden sm:inline-block">
                            {format(item._creationTime, "MMM d, yyyy")}
                          </span>
                        </div>
                      </>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
