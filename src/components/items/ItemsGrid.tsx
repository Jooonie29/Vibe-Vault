import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Grid3X3,
  List,
  Star,
  Code2,
  MessageSquare,
  FolderOpen,
  Filter,
  SortAsc,
  MoreVertical,
  Clock,
} from "lucide-react";
import { useItems } from "@/hooks/useItems";
import { useUIStore } from "@/store/uiStore";
import { Item, ItemType } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { format } from "date-fns";

interface ItemsGridProps {
  type: ItemType;
  title: string;
  description: string;
}

const typeIcons = {
  code: Code2,
  prompt: MessageSquare,
  file: FolderOpen,
};

const typeColors = {
  code: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    gradient: "from-blue-500 to-cyan-500",
    border: "hover:border-blue-200",
  },
  prompt: {
    bg: "bg-purple-50",
    text: "text-purple-600",
    gradient: "from-purple-500 to-pink-500",
    border: "hover:border-purple-200",
  },
  file: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    gradient: "from-amber-500 to-orange-500",
    border: "hover:border-amber-200",
  },
};

const codeCategories = [
  "All",
  "utility",
  "component",
  "hook",
  "api",
  "algorithm",
  "ui",
  "backend",
  "testing",
  "other",
];
const promptCategories = [
  "All",
  "creative",
  "technical",
  "analysis",
  "writing",
  "debugging",
  "optimization",
  "refactoring",
  "documentation",
  "learning",
  "other",
];
const fileCategories = [
  "All",
  "asset",
  "icon",
  "image",
  "style",
  "config",
  "template",
  "other",
];

const getCategoriesByType = (type: ItemType) => {
  switch (type) {
    case "code":
      return codeCategories;
    case "prompt":
      return promptCategories;
    case "file":
      return fileCategories;
    default:
      return codeCategories;
  }
};

export function ItemsGrid({ type, title, description }: ItemsGridProps) {
  const { data: items, isLoading } = useItems(type);
  const { openModal, initializedViews, markViewInitialized } = useUIStore();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title">("newest");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const hasInitialized = initializedViews.has(type);

  React.useEffect(() => {
    if (!hasInitialized) {
      const viewMap: Record<string, any> = {
        code: 'code',
        prompt: 'prompts',
        file: 'files'
      };
      markViewInitialized(viewMap[type]);
    }
  }, [hasInitialized, markViewInitialized, type]);

  const Icon = typeIcons[type];
  const colors = typeColors[type];

  const filteredItems = useMemo(() => {
    if (!items) return [];

    let filtered = [...items];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.content?.toLowerCase().includes(query),
      );
    }

    // Category filter
    if (selectedCategory !== "All") {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    // Favorites filter
    if (showFavoritesOnly) {
      filtered = filtered.filter((item) => item.isFavorite);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "newest") {
        return (b as any)._creationTime - (a as any)._creationTime;
      } else if (sortBy === "oldest") {
        return (a as any)._creationTime - (b as any)._creationTime;
      } else {
        return a.title.localeCompare(b.title);
      }
    });

    return filtered;
  }, [items, searchQuery, selectedCategory, sortBy, showFavoritesOnly]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-2xl ${colors.bg} flex items-center justify-center shadow-sm`}
            >
              <Icon className={`w-6 h-6 ${colors.text}`} />
            </div>
            {title}
          </h1>
          <p className="text-gray-500 mt-2 text-lg max-w-2xl">{description}</p>
        </div>
        <Button
          onClick={() => openModal("item", { type })}
          icon={<Plus className="w-5 h-5" />}
          className="shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 transition-all duration-300"
          size="lg"
        >
          New{" "}
          {type === "code" ? "Snippet" : type === "prompt" ? "Prompt" : "File"}
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#0f1117] p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-white/10 space-y-4">
        <div className="flex flex-col xl:flex-row gap-4">
          <div className="flex-1">
            <Input
              isSearch
              placeholder={`Search ${type === "code" ? "snippets" : type === "prompt" ? "prompts" : "files"}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-50 dark:bg-white/5 border-transparent focus:bg-white dark:focus:bg-white/10"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Favorites Toggle */}
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`p-3 rounded-2xl transition-all duration-300 border ${showFavoritesOnly
                  ? "bg-amber-50 dark:bg-amber-900/20 text-amber-500 border-amber-200 dark:border-amber-700 shadow-sm"
                  : "bg-white dark:bg-white/5 text-gray-400 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 hover:text-amber-400"
                }`}
              title="Show Favorites"
            >
              <Star
                className={`w-5 h-5 ${showFavoritesOnly ? "fill-current" : ""}`}
              />
            </button>

            {/* Sort */}
            <div className="w-40">
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                options={[
                  { value: "newest", label: "Newest" },
                  { value: "oldest", label: "Oldest" },
                  { value: "title", label: "A-Z" },
                ]}
                className="py-3"
              />
            </div>

            {/* View Toggle */}
            <div className="flex bg-gray-100 dark:bg-white/5 p-1.5 rounded-2xl">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2.5 rounded-xl transition-all duration-300 ${viewMode === "grid"
                    ? "bg-white dark:bg-white/10 shadow-sm text-gray-900 dark:text-white"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  }`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2.5 rounded-xl transition-all duration-300 ${viewMode === "list"
                    ? "bg-white dark:bg-white/10 shadow-sm text-gray-900 dark:text-white"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide -mx-3 px-3">
          {getCategoriesByType(type).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300 ${selectedCategory === cat
                  ? `bg-gradient-to-r ${colors.gradient} text-white shadow-md shadow-violet-500/25`
                  : "bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white border border-transparent hover:border-gray-200 dark:hover:border-white/20"
                }`}
            >
              {cat === "All"
                ? "All"
                : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid/List */}
      {isLoading ? (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
          }
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-24 bg-white dark:bg-[#0f1117] rounded-[2.5rem] border border-dashed border-gray-200 dark:border-white/10 shadow-sm">
          <div
            className={`w-24 h-24 rounded-[2rem] ${colors.bg} dark:bg-white/5 flex items-center justify-center mx-auto mb-8 shadow-sm`}
          >
            <Icon className={`w-12 h-12 ${colors.text}`} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {searchQuery || selectedCategory !== "All"
              ? "No matching items found"
              : `No ${type === "code" ? "snippets" : type === "prompt" ? "prompts" : "files"} yet`}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto text-lg">
            {searchQuery || selectedCategory !== "All"
              ? "Try adjusting your filters or search terms"
              : `Create your first ${type === "code" ? "code snippet" : type === "prompt" ? "AI prompt" : "file"} to get started.`}
          </p>
          {!searchQuery && selectedCategory === "All" && (
            <Button
              onClick={() => openModal("item", { type })}
              icon={<Plus className="w-5 h-5" />}
              size="lg"
              className="shadow-xl shadow-violet-500/20"
            >
              Create{" "}
              {type === "code"
                ? "Snippet"
                : type === "prompt"
                  ? "Prompt"
                  : "File"}
            </Button>
          )}
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <motion.div
            layout
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }
          >
            {filteredItems.map((item, index) => (
              <motion.div key={item.id} layout>
                <ItemCard
                  item={item}
                  viewMode={viewMode}
                  colors={colors}
                  onOpen={(item) => openModal("item", item)}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

function ItemCard({
  item,
  viewMode,
  colors,
  onOpen,
}: {
  item: Item;
  viewMode: "grid" | "list";
  colors: { bg: string; text: string; gradient: string; border: string };
  onOpen: (item: Item) => void;
}) {
  const Icon = typeIcons[item.type];

  if (viewMode === "list") {
    return (
      <div
        onClick={() => onOpen(item)}
        className={`group flex items-center gap-5 bg-white dark:bg-[#0f1117] p-4 rounded-3xl border border-gray-100 dark:border-white/10 ${colors.border} hover:shadow-lg transition-all duration-300 cursor-pointer relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/50 dark:to-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        <div
          className={`w-14 h-14 rounded-2xl ${colors.bg} dark:bg-white/5 flex items-center justify-center flex-shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}
        >
          <Icon className={`w-7 h-7 ${colors.text}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1.5">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate group-hover:text-violet-600 transition-colors">
              {item.title}
            </h3>
            {item.isFavorite && (
              <Star className="w-4 h-4 text-yellow-400 fill-current flex-shrink-0 animate-pulse" />
            )}
          </div>
          {item.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate font-medium">
              {item.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="flex gap-2">
            {item.language && item.type !== "prompt" && (
              <Badge
                variant="primary"
                className="hidden md:flex bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 border-violet-100 dark:border-violet-800"
              >
                {item.language}
              </Badge>
            )}
            {item.category && (
              <Badge className="hidden sm:flex bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10">
                {item.category}
              </Badge>
            )}
          </div>
          <div className="text-right pl-4 border-l border-gray-100 dark:border-white/10 hidden sm:block">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Created
            </div>
            <div className="text-xs font-bold text-gray-700 dark:text-gray-300">
              {format(new Date((item as any)._creationTime), "MMM d")}
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-violet-50 dark:group-hover:bg-violet-900/20 transition-colors">
            <MoreVertical className="w-4 h-4 text-gray-400 group-hover:text-violet-500" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onOpen(item)}
      className={`group h-full flex flex-col bg-white dark:bg-[#0f1117] rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-white/10 ${colors.border} cursor-pointer relative overflow-hidden`}
    >
      <div
        className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${colors.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />

      <div className="flex items-start justify-between mb-5">
        <div
          className={`w-14 h-14 rounded-2xl ${colors.bg} dark:bg-white/5 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6 shadow-sm`}
        >
          <Icon className={`w-7 h-7 ${colors.text}`} />
        </div>
        {item.isFavorite && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-1.5 rounded-full">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
          </div>
        )}
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-1 group-hover:text-violet-600 transition-colors">
        {item.title}
      </h3>

      {item.description && (
        <p className="text-sm text-gray-500 mb-5 line-clamp-2 flex-1 leading-relaxed font-medium">
          {item.description}
        </p>
      )}

      {item.content && (
        <div className="bg-gray-50/80 rounded-2xl p-4 mb-5 overflow-hidden border border-gray-100 group-hover:border-violet-100 transition-colors relative">
          <div className="absolute top-2 right-2 flex gap-1">
            <div className="w-2 h-2 rounded-full bg-gray-200"></div>
            <div className="w-2 h-2 rounded-full bg-gray-200"></div>
            <div className="w-2 h-2 rounded-full bg-gray-200"></div>
          </div>
          <pre className="text-[10px] text-gray-600 font-mono line-clamp-3 leading-relaxed opacity-80 pt-2">
            {item.content}
          </pre>
        </div>
      )}

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
        <div className="flex gap-2">
          {item.language && item.type !== "prompt" && (
            <Badge
              variant="primary"
              size="sm"
              className="bg-violet-50 text-violet-600 border-violet-100 shadow-none"
            >
              {item.language}
            </Badge>
          )}
          {item.category && (
            <Badge
              size="sm"
              className="bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200 shadow-none"
            >
              {item.category}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold">
          <Clock className="w-3.5 h-3.5" />
          {format(new Date((item as any)._creationTime), "MMM d")}
        </div>
      </div>
    </div>
  );
}
