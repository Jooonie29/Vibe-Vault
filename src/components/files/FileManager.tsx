import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
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
  Search,
} from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useItems, useCreateItem, useDeleteItem } from "@/hooks/useItems";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { Item } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { format } from "date-fns";

const fileTypeIcons: Record<string, React.ElementType> = {
  image: FileImage,
  pdf: FileText,
  code: FileCode,
  archive: FileArchive,
  default: File,
};

const getFileIcon = (fileType: string | null) => {
  if (!fileType) return fileTypeIcons.default;
  if (fileType.startsWith("image/")) return fileTypeIcons.image;
  if (fileType === "application/pdf") return fileTypeIcons.pdf;
  if (
    fileType.includes("zip") ||
    fileType.includes("rar") ||
    fileType.includes("tar")
  )
    return fileTypeIcons.archive;
  if (
    fileType.includes("javascript") ||
    fileType.includes("json") ||
    fileType.includes("text/")
  )
    return fileTypeIcons.code;
  return fileTypeIcons.default;
};

const formatFileSize = (bytes: number | null) => {
  if (!bytes) return "Unknown size";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function FileManager() {
  const { user } = useAuthStore();
  const { addToast, initializedViews, markViewInitialized } = useUIStore();
  const { data: files, isLoading } = useItems("file");
  const createItem = useCreateItem();
  const deleteItem = useDeleteItem();
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const hasInitialized = initializedViews.has("files");

  React.useEffect(() => {
    if (!hasInitialized) {
      markViewInitialized("files");
    }
  }, [hasInitialized, markViewInitialized]);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewFile, setPreviewFile] = useState<Item | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
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
            type: "file",
            title: file.name,
            description: `Uploaded on ${format(new Date(), "MMMM d, yyyy")}`,
            fileUrl: undefined,
            fileType: file.type,
            fileSize: file.size,
            metadata: { originalName: file.name, storageId },
          });

          setUploadProgress(((i + 1) / acceptedFiles.length) * 100);
        } catch (error: any) {
          addToast({
            type: "error",
            title: "Upload failed",
            message: error.message,
          });
        }
      }

      setUploading(false);
      setUploadProgress(0);
    },
    [user, createItem, generateUploadUrl, addToast],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"],
      "application/pdf": [".pdf"],
      "application/zip": [".zip"],
      "application/x-rar-compressed": [".rar"],
      "text/*": [".txt", ".md", ".json", ".js", ".ts", ".css", ".html"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleDownload = async (file: Item) => {
    if (!file.fileUrl) return;
    window.open(file.fileUrl, "_blank");
  };

  const handleDelete = async (id: string) => {
    await deleteItem.mutateAsync(id);
    setConfirmDelete(null);
  };

  const filteredFiles =
    files?.filter((file) =>
      file.title.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center shadow-sm">
              <FolderOpen className="w-6 h-6 text-amber-500" />
            </div>
            File Assets
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Upload and manage your design files, icons, and documents
          </p>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="bg-card rounded-[24px] p-2 shadow-sm border border-border">
        <div
          {...getRootProps()}
          className={`p-4 border-2 border-dashed rounded-[20px] transition-all duration-300 cursor-pointer group ${
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary hover:bg-secondary/50"
          }`}
        >
          <input {...getInputProps()} />
          <div className="text-center">
            <div
              className={`w-12 h-12 rounded-[16px] mx-auto mb-2 flex items-center justify-center transition-all duration-300 shadow-sm ${isDragActive ? "bg-primary/10 scale-110" : "bg-secondary group-hover:bg-primary/10 group-hover:scale-105"}`}
            >
              <Upload
                className={`w-6 h-6 transition-colors duration-300 ${isDragActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`}
              />
            </div>
            {uploading ? (
              <>
                <p className="text-base font-bold text-foreground mb-2">
                  Uploading files...
                </p>
                <div className="w-64 h-2.5 bg-secondary rounded-full mx-auto overflow-hidden ring-1 ring-border">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
                  />
                </div>
              </>
            ) : (
              <>
                <h3 className="text-base font-bold text-foreground mb-1 tracking-tight">
                  {isDragActive
                    ? "Drop files to upload"
                    : "Drag & drop files here"}
                </h3>
                <p className="text-muted-foreground mb-3 max-w-sm mx-auto text-xs">
                  Support for images, documents, archives and code files up to 10MB
                </p>
                <Button
                  variant="secondary"
                  className="pointer-events-none rounded-lg px-5 py-2 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 border-0"
                >
                  Browse Files
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-2.5 rounded-[24px] shadow-sm border border-border">
        <div className="flex-1 w-full md:w-auto relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-3 bg-secondary/50 border-transparent rounded-2xl text-base focus:bg-card focus:border-primary/20 focus:ring-4 focus:ring-primary/10 transition-all outline-none placeholder:text-muted-foreground/50 text-foreground"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="flex bg-secondary p-1.5 rounded-2xl">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2.5 rounded-xl transition-all duration-300 ${
              viewMode === "grid"
                ? "bg-card shadow-md text-primary scale-100"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Grid3X3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2.5 rounded-xl transition-all duration-300 ${
              viewMode === "list"
                ? "bg-card shadow-md text-primary scale-100"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Files Grid/List */}
      {isLoading ? (
        <div className="text-center py-32">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-6" />
          <p className="text-muted-foreground text-lg font-medium">
            Loading your assets...
          </p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-32 bg-card rounded-[32px] border border-dashed border-border">
          <div className="w-24 h-24 rounded-[32px] bg-muted/50 flex items-center justify-center mx-auto mb-6">
            <FolderOpen className="w-12 h-12 text-muted-foreground/30" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-3">
            {searchQuery ? "No matching files found" : "No files uploaded yet"}
          </h3>
          <p className="text-muted-foreground max-w-sm mx-auto text-lg">
            {searchQuery
              ? "Try adjusting your search terms"
              : "Upload your first file to get started with your collection"}
          </p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <motion.div
            layout
            className={
              viewMode === "grid"
                ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
                : "space-y-4"
            }
          >
            {filteredFiles.map((file, index) => {
              const FileIcon = getFileIcon(file.fileType);
              const isImage = file.fileType?.startsWith("image/");

              return (
                <motion.div key={file.id} layout>
                  {viewMode === "grid" ? (
                    <div className="group relative bg-card rounded-[24px] p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.12)] transition-all duration-300 border border-border h-full flex flex-col z-0 hover:z-10">
                      {/* Preview */}
                      <div className="aspect-square bg-muted/50 rounded-2xl mb-5 flex items-center justify-center overflow-hidden relative group-hover:shadow-inner transition-shadow">
                        {isImage && file.fileUrl ? (
                          <img
                            src={file.fileUrl}
                            alt={file.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <FileIcon className="w-20 h-20 text-muted-foreground/30 group-hover:text-primary transition-colors duration-300" />
                        )}

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                          {isImage && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewFile(file);
                              }}
                              className="p-3 bg-background/90 rounded-2xl hover:bg-background hover:scale-110 transition-all shadow-lg text-foreground hover:text-primary"
                              title="Preview"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(file);
                            }}
                            className="p-3 bg-background/90 rounded-2xl hover:bg-background hover:scale-110 transition-all shadow-lg text-foreground hover:text-primary"
                            title="Download"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex items-start justify-between gap-3 mt-auto">
                        <div className="min-w-0">
                          <h4
                            className="font-bold text-foreground truncate text-sm mb-1.5"
                            title={file.title}
                          >
                            {file.title}
                          </h4>
                          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                            {formatFileSize(file.fileSize)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDelete(file.id);
                          }}
                          className="text-muted-foreground hover:text-destructive transition-colors p-1.5 hover:bg-destructive/10 rounded-lg -mr-2 opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="group flex items-center gap-5 bg-card p-4 rounded-[20px] border border-border hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                      <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center flex-shrink-0 overflow-hidden ring-1 ring-border">
                        {isImage && file.fileUrl ? (
                          <img
                            src={file.fileUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FileIcon className="w-7 h-7 text-muted-foreground/50" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                        <h4 className="font-bold text-foreground truncate text-base">
                          {file.title}
                        </h4>
                        <p className="text-sm text-muted-foreground font-medium hidden md:block">
                          {formatFileSize(file.fileSize)}
                        </p>
                        <p className="text-sm text-muted-foreground/70 hidden md:block text-right font-medium">
                          {format(
                            new Date((file as any)._creationTime),
                            "MMM d, yyyy",
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isImage && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setPreviewFile(file)}
                            className="rounded-xl hover:bg-primary/10 hover:text-primary"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDownload(file)}
                          className="rounded-xl hover:bg-primary/10 hover:text-primary"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setConfirmDelete(file.id)}
                          className="text-destructive hover:bg-destructive/10 rounded-xl"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Preview Modal */}
      <Modal
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
        size="xl"
      >
        {previewFile && (
          <div className="p-4">
            <img
              src={previewFile.fileUrl || ""}
              alt={previewFile.title}
              className="w-full h-auto max-h-[70vh] object-contain rounded-xl"
            />
            <div className="mt-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">
                  {previewFile.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(previewFile.fileSize)}
                </p>
              </div>
              <Button
                onClick={() => handleDownload(previewFile)}
                icon={<Download className="w-4 h-4" />}
              >
                Download
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        size="sm"
      >
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Delete File?
          </h3>
          <p className="text-muted-foreground mb-6">
            This action cannot be undone.
          </p>
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
