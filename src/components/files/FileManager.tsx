import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  FolderOpen,
  File,
  FileImage,
  FileText,
  FileCode,
  FileArchive,
  Download,
  Trash2,
  Eye,
  X,
  Plus,
  Grid3X3,
  List,
  Search
} from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useItems, useCreateItem, useDeleteItem } from '@/hooks/useItems';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { Item } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { format } from 'date-fns';

const fileTypeIcons: Record<string, React.ElementType> = {
  image: FileImage,
  pdf: FileText,
  code: FileCode,
  archive: FileArchive,
  default: File,
};

const getFileIcon = (fileType: string | null) => {
  if (!fileType) return fileTypeIcons.default;
  if (fileType.startsWith('image/')) return fileTypeIcons.image;
  if (fileType === 'application/pdf') return fileTypeIcons.pdf;
  if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('tar')) return fileTypeIcons.archive;
  if (fileType.includes('javascript') || fileType.includes('json') || fileType.includes('text/')) return fileTypeIcons.code;
  return fileTypeIcons.default;
};

const formatFileSize = (bytes: number | null) => {
  if (!bytes) return 'Unknown size';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function FileManager() {
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const { data: files, isLoading } = useItems('file');
  const createItem = useCreateItem();
  const deleteItem = useDeleteItem();
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewFile, setPreviewFile] = useState<Item | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!user) return;

    setUploading(true);
    setUploadProgress(0);

    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i];

      try {
        // Step 1: Get a short-lived upload URL from Convex
        const postUrl = await generateUploadUrl();

        // Step 2: POST the file to the URL
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId } = await result.json();

        // Step 3: Create item record in Convex
        await createItem.mutateAsync({
          type: 'file',
          title: file.name,
          description: `Uploaded on ${format(new Date(), 'MMMM d, yyyy')}`,
          fileUrl: undefined,
          fileType: file.type,
          fileSize: file.size,
          metadata: { originalName: file.name, storageId },
        });

        setUploadProgress(((i + 1) / acceptedFiles.length) * 100);
      } catch (error: any) {
        addToast({ type: 'error', title: 'Upload failed', message: error.message });
      }
    }

    setUploading(false);
    setUploadProgress(0);
  }, [user, createItem, generateUploadUrl, addToast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'],
      'application/pdf': ['.pdf'],
      'application/zip': ['.zip'],
      'application/x-rar-compressed': ['.rar'],
      'text/*': ['.txt', '.md', '.json', '.js', '.ts', '.css', '.html'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleDownload = async (file: Item) => {
    if (!file.fileUrl) return;
    window.open(file.fileUrl, '_blank');
  };

  const handleDelete = async (id: string) => {
    await deleteItem.mutateAsync(id);
    setConfirmDelete(null);
  };

  const filteredFiles = files?.filter((file) =>
    file.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-amber-600" />
            </div>
            File Assets
          </h1>
          <p className="text-gray-500 mt-1">Upload and manage your design files, icons, and documents</p>
        </div>
      </div>

      {/* Upload Zone */}
      <Card padding="none">
        <div
          {...getRootProps()}
          className={`p-8 border-2 border-dashed rounded-2xl transition-colors cursor-pointer ${isDragActive
            ? 'border-violet-500 bg-violet-50'
            : 'border-gray-200 hover:border-violet-300 hover:bg-gray-50'
            }`}
        >
          <input {...getInputProps()} />
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-4">
              <Upload className={`w-8 h-8 ${isDragActive ? 'text-violet-600' : 'text-violet-500'}`} />
            </div>
            {uploading ? (
              <>
                <p className="text-lg font-medium text-gray-900 mb-2">Uploading...</p>
                <div className="w-64 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    className="h-full bg-violet-500 rounded-full"
                  />
                </div>
              </>
            ) : (
              <>
                <p className="text-lg font-medium text-gray-900 mb-1">
                  {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
                </p>
                <p className="text-sm text-gray-500">
                  or click to browse (max 10MB per file)
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Supports: Images, PDFs, ZIP, Text files
                </p>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card padding="sm">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              isSearch
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
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
      </Card>

      {/* Files Grid/List */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading files...</div>
      ) : filteredFiles.length === 0 ? (
        <Card className="text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-8 h-8 text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchQuery ? 'No matching files' : 'No files yet'}
          </h3>
          <p className="text-gray-500">
            {searchQuery ? 'Try a different search term' : 'Upload your first file to get started'}
          </p>
        </Card>
      ) : (
        <AnimatePresence mode="popLayout">
          <motion.div
            layout
            className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-3'}
          >
            {filteredFiles.map((file, index) => {
              const FileIcon = getFileIcon(file.fileType);
              const isImage = file.fileType?.startsWith('image/');

              return (
                <motion.div
                  key={file.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {viewMode === 'grid' ? (
                    <Card hover className="group relative overflow-hidden">
                      {/* Preview */}
                      <div className="aspect-square bg-gray-100 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                        {isImage && file.fileUrl ? (
                          <img
                            src={file.fileUrl}
                            alt={file.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FileIcon className="w-12 h-12 text-gray-400" />
                        )}
                      </div>

                      {/* Info */}
                      <h4 className="font-medium text-gray-900 truncate mb-1">{file.title}</h4>
                      <p className="text-xs text-gray-500">{formatFileSize(file.fileSize)}</p>

                      {/* Hover Actions */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-2xl">
                        {isImage && (
                          <button
                            onClick={() => setPreviewFile(file)}
                            className="p-2 bg-white rounded-xl hover:bg-gray-100 transition-colors"
                          >
                            <Eye className="w-5 h-5 text-gray-700" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDownload(file)}
                          className="p-2 bg-white rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <Download className="w-5 h-5 text-gray-700" />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(file.id)}
                          className="p-2 bg-white rounded-xl hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </button>
                      </div>
                    </Card>
                  ) : (
                    <Card hover padding="sm">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {isImage && file.fileUrl ? (
                            <img src={file.fileUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <FileIcon className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{file.title}</h4>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(file.fileSize)} • {format(new Date((file as any)._creationTime), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {isImage && (
                            <Button size="sm" variant="ghost" onClick={() => setPreviewFile(file)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => handleDownload(file)}>
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setConfirmDelete(file.id)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Preview Modal */}
      <Modal isOpen={!!previewFile} onClose={() => setPreviewFile(null)} size="xl">
        {previewFile && (
          <div className="p-4">
            <img
              src={previewFile.fileUrl || ''}
              alt={previewFile.title}
              className="w-full h-auto max-h-[70vh] object-contain rounded-xl"
            />
            <div className="mt-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{previewFile.title}</h3>
                <p className="text-sm text-gray-500">{formatFileSize(previewFile.fileSize)}</p>
              </div>
              <Button onClick={() => handleDownload(previewFile)} icon={<Download className="w-4 h-4" />}>
                Download
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} size="sm">
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete File?</h3>
          <p className="text-gray-500 mb-6">This action cannot be undone.</p>
          <div className="flex gap-3 justify-center">
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => confirmDelete && handleDelete(confirmDelete)}
              loading={deleteItem.isPending}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
