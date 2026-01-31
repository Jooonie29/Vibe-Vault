import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  SortAsc
} from 'lucide-react';
import { useItems } from '@/hooks/useItems';
import { useUIStore } from '@/store/uiStore';
import { Item, ItemType } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { format } from 'date-fns';

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
  code: { bg: 'bg-blue-100', text: 'text-blue-600', gradient: 'from-blue-500 to-cyan-500' },
  prompt: { bg: 'bg-purple-100', text: 'text-purple-600', gradient: 'from-purple-500 to-pink-500' },
  file: { bg: 'bg-amber-100', text: 'text-amber-600', gradient: 'from-amber-500 to-orange-500' },
};

const codeCategories = ['All', 'utility', 'component', 'hook', 'api', 'algorithm', 'ui', 'backend', 'testing', 'other'];
const promptCategories = ['All', 'creative', 'technical', 'analysis', 'writing', 'debugging', 'optimization', 'refactoring', 'documentation', 'learning', 'other'];
const fileCategories = ['All', 'asset', 'icon', 'image', 'style', 'config', 'template', 'other'];

const getCategoriesByType = (type: ItemType) => {
  switch (type) {
    case 'code':
      return codeCategories;
    case 'prompt':
      return promptCategories;
    case 'file':
      return fileCategories;
    default:
      return codeCategories;
  }
};

export function ItemsGrid({ type, title, description }: ItemsGridProps) {
  const { data: items, isLoading } = useItems(type);
  const { openModal } = useUIStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

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
          item.content?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    // Favorites filter
    if (showFavoritesOnly) {
      filtered = filtered.filter((item) => item.isFavorite);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'newest') {
        return (b as any)._creationTime - (a as any)._creationTime;
      } else if (sortBy === 'oldest') {
        return (a as any)._creationTime - (b as any)._creationTime;
      } else {
        return a.title.localeCompare(b.title);
      }
    });

    return filtered;
  }, [items, searchQuery, selectedCategory, sortBy, showFavoritesOnly]);


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${colors.text}`} />
            </div>
            {title}
          </h1>
          <p className="text-gray-500 mt-1">{description}</p>
        </div>
        <Button
          onClick={() => openModal('item', { type })}
          icon={<Plus className="w-4 h-4" />}
        >
          New {type === 'code' ? 'Snippet' : type === 'prompt' ? 'Prompt' : 'File'}
        </Button>
      </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              isSearch
              placeholder={`Search ${type === 'code' ? 'snippets' : type === 'prompt' ? 'prompts' : 'files'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Pills */}
            <div className="flex gap-1 overflow-x-auto pb-1 max-w-full">
              {getCategoriesByType(type).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat
                    ? `bg-gradient-to-r ${colors.gradient} text-white`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {cat === 'All' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>

            {/* Favorites Toggle */}
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`p-2 rounded-xl transition-colors ${showFavoritesOnly
                ? 'bg-yellow-100 text-yellow-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              <Star className={`w-5 h-5 ${showFavoritesOnly ? 'fill-current' : ''}`} />
            </button>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium border-0 focus:ring-2 focus:ring-violet-500/20"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="title">A-Z</option>
            </select>

            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500'
                  }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'
                  }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Items Grid/List */}
      {isLoading ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <Card className="text-center py-12">
          <div className={`w-16 h-16 rounded-2xl ${colors.bg} flex items-center justify-center mx-auto mb-4`}>
            <Icon className={`w-8 h-8 ${colors.text}`} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchQuery || selectedCategory !== 'All' ? 'No matching items' : `No ${type === 'code' ? 'snippets' : type === 'prompt' ? 'prompts' : 'files'} yet`}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || selectedCategory !== 'All'
              ? 'Try adjusting your filters'
              : `Create your first ${type === 'code' ? 'code snippet' : type === 'prompt' ? 'AI prompt' : 'file'} to get started.`}
          </p>
          {!searchQuery && selectedCategory === 'All' && (
            <Button onClick={() => openModal('item', { type })} icon={<Plus className="w-4 h-4" />}>
              Create {type === 'code' ? 'Snippet' : type === 'prompt' ? 'Prompt' : 'File'}
            </Button>
          )}
        </Card>
      ) : (
        <AnimatePresence mode="popLayout">
          <motion.div
            layout
            className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}
          >
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <ItemCard
                  item={item}
                  viewMode={viewMode}
                  colors={colors}
                  onOpen={(item) => openModal('item', item)}
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
  onOpen
}: {
  item: Item;
  viewMode: 'grid' | 'list';
  colors: { bg: string; text: string; gradient: string };
  onOpen: (item: Item) => void;
}) {
  const Icon = typeIcons[item.type];

  if (viewMode === 'list') {
    return (
      <Card hover onClick={() => onOpen(item)} padding="sm">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-5 h-5 ${colors.text}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 truncate">{item.title}</h3>
              {item.isFavorite && <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />}
            </div>
            {item.description && (
              <p className="text-sm text-gray-500 truncate">{item.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {item.language && item.type !== 'prompt' && <Badge variant="primary">{item.language}</Badge>}
            {item.category && <Badge>{item.category}</Badge>}
            <span className="text-xs text-gray-400">
              {format(new Date((item as any)._creationTime), 'MMM d')}
            </span>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card hover onClick={() => onOpen(item)} className="h-full flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${colors.text}`} />
        </div>
        {item.isFavorite && <Star className="w-5 h-5 text-yellow-500 fill-current" />}
      </div>
      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{item.title}</h3>
      {item.description && (
        <p className="text-sm text-gray-500 mb-3 line-clamp-2 flex-1">{item.description}</p>
      )}
      {item.content && (
        <div className="bg-gray-900 rounded-lg p-3 mb-3 overflow-hidden">
          <pre className="text-xs text-gray-300 font-mono line-clamp-3">{item.content}</pre>
        </div>
      )}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
        <div className="flex gap-1.5">
          {item.language && item.type !== 'prompt' && <Badge variant="primary" size="sm">{item.language}</Badge>}
          {item.category && <Badge size="sm">{item.category}</Badge>}
        </div>
        <span className="text-xs text-gray-400">
          {format(new Date((item as any)._creationTime), 'MMM d')}
        </span>
      </div>
    </Card>
  );
}
