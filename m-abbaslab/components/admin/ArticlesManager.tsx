'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Search,
  Eye,
  EyeOff,
  Copy,
  Download,
  CheckSquare,
  Square,
  ChevronDown,
  FileText,
  Calendar,
  Tag,
  Clock,
  Sparkles,
  Send,
  Loader2,
  ExternalLink,
  ArrowUpDown,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  category: string;
  tags: string[];
  published: boolean;
  featuredImage?: string;
  author?: string;
  createdAt: string;
  updatedAt: string;
}

interface ArticlesManagerProps {
  initialArticles?: Article[];
}

const CATEGORIES = [
  'Technology',
  'Programming',
  'Design',
  'Business',
  'AI & ML',
  'Web Development',
  'Mobile',
  'DevOps',
  'Tutorial',
  'Opinion',
  'Other'
];

export default function ArticlesManager({ initialArticles = [] }: ArticlesManagerProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previewArticle, setPreviewArticle] = useState<Article | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState<Partial<Article>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [bulkActionOpen, setBulkActionOpen] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [generatingAi, setGeneratingAi] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'alpha' | 'status'>('newest');

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/articles');
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles || data || []);
      }
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWordCount = (content: string) => {
    if (!content) return 0;
    return content.trim().split(/\s+/).filter((word) => word.length > 0).length;
  };

  const filteredArticles = articles
    .filter((a) => {
      const matchesSearch =
        searchQuery === '' ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = categoryFilter === 'all' || a.category === categoryFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'published' && a.published) ||
        (statusFilter === 'draft' && !a.published);
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'alpha':
          return a.title.localeCompare(b.title);
        case 'status':
          return (a.published ? 0 : 1) - (b.published ? 0 : 1);
        default:
          return 0;
      }
    });

  const handleSelectAll = () => {
    const allSelected = filteredArticles.every((a) => selectedIds.has(a.id));
    const newSelected = new Set<string>();
    if (!allSelected) {
      filteredArticles.forEach((a) => newSelected.add(a.id));
    }
    setSelectedIds(newSelected);
  };

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.size} article(s)?`)) return;
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          fetch(`/api/admin/articles/${id}`, { method: 'DELETE' })
        )
      );
      setArticles(articles.filter((a) => !selectedIds.has(a.id)));
      setSelectedIds(new Set());
    } catch (error) {
      console.error('Bulk delete failed:', error);
    }
  };

  const handleBulkPublish = async (published: boolean) => {
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          fetch(`/api/admin/articles/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ published })
          })
        )
      );
      setArticles(
        articles.map((a) =>
          selectedIds.has(a.id) ? { ...a, published } : a
        )
      );
      setSelectedIds(new Set());
    } catch (error) {
      console.error('Bulk publish failed:', error);
    }
  };

  const handleQuickToggle = async (article: Article) => {
    try {
      const res = await fetch(`/api/admin/articles/${article.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !article.published })
      });
      if (res.ok) {
        setArticles(
          articles.map((a) =>
            a.id === article.id ? { ...a, published: !a.published } : a
          )
        );
      }
    } catch (error) {
      console.error('Toggle status failed:', error);
    }
  };

  const handleDuplicate = async (article: Article) => {
    try {
      const res = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...article,
          id: undefined,
          title: `${article.title} (Copy)`,
          slug: `${article.slug}-copy`,
          published: false,
          createdAt: undefined,
          updatedAt: undefined
        })
      });
      if (res.ok) {
        const newArticle = await res.json();
        setArticles([...articles, newArticle]);
      }
    } catch (error) {
      console.error('Duplicate failed:', error);
    }
  };

  const handleExport = () => {
    const exportData = selectedIds.size > 0
      ? articles.filter((a) => selectedIds.has(a.id))
      : filteredArticles;
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `articles-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const slug = formData.title
        ?.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || '';
      const method = editingArticle ? 'PATCH' : 'POST';
      const url = editingArticle
        ? `/api/admin/articles/${editingArticle.id}`
        : '/api/admin/articles';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, slug })
      });
      if (res.ok) {
        const saved = await res.json();
        if (editingArticle) {
          setArticles(articles.map((a) => (a.id === editingArticle.id ? saved : a)));
        } else {
          setArticles([...articles, saved]);
        }
        setShowForm(false);
        setEditingArticle(null);
        setFormData({});
      }
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this article?')) return;
    try {
      const res = await fetch(`/api/admin/articles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setArticles(articles.filter((a) => a.id !== id));
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const generateAiContent = async () => {
    if (!aiPrompt.trim()) return;
    setGeneratingAi(true);
    try {
      const res = await fetch('/api/admin/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt })
      });
      if (res.ok) {
        const data = await res.json();
        setAiResponse(data.content);
        setFormData({ ...formData, content: (formData.content || '') + '\n\n' + data.content });
      }
    } catch (error) {
      console.error('AI generation failed:', error);
    } finally {
      setGeneratingAi(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((t) => t !== tag) || []
    });
  };

  const openEditForm = (article: Article) => {
    setEditingArticle(article);
    setFormData({ ...article });
    setShowForm(true);
  };

  const openNewForm = () => {
    setEditingArticle(null);
    setFormData({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      category: 'Technology',
      tags: [],
      published: false,
      featuredImage: '',
      author: ''
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Articles Manager</h2>
          <p className="text-slate-400 text-sm mt-1">
            Manage your blog articles and content
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={openNewForm}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Article
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search articles by title, content, category, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="relative">
          <button
            onClick={() => { setShowCategoryMenu(!showCategoryMenu); setShowStatusMenu(false); }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white hover:bg-slate-700 transition-colors"
          >
            <Tag className="w-4 h-4" />
            {categoryFilter === 'all' ? 'All Categories' : categoryFilter}
            <ChevronDown className="w-4 h-4" />
          </button>
          {showCategoryMenu && (
            <div className="absolute top-full mt-1 left-0 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10 max-h-64 overflow-y-auto">
              <button
                onClick={() => { setCategoryFilter('all'); setShowCategoryMenu(false); }}
                className="w-full px-4 py-2 text-left text-white hover:bg-slate-700 rounded-t-lg"
              >
                All Categories
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setCategoryFilter(cat); setShowCategoryMenu(false); }}
                  className="w-full px-4 py-2 text-left text-white hover:bg-slate-700"
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="relative">
          <button
            onClick={() => { setShowStatusMenu(!showStatusMenu); setShowCategoryMenu(false); }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white hover:bg-slate-700 transition-colors"
          >
            <Filter className="w-4 h-4" />
            {statusFilter === 'all' ? 'All Status' : statusFilter === 'published' ? 'Published' : 'Draft'}
            <ChevronDown className="w-4 h-4" />
          </button>
          {showStatusMenu && (
            <div className="absolute top-full mt-1 left-0 w-44 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10">
              <button
                onClick={() => { setStatusFilter('all'); setShowStatusMenu(false); }}
                className="w-full px-4 py-2 text-left text-white hover:bg-slate-700 rounded-t-lg"
              >
                All Status
              </button>
              <button
                onClick={() => { setStatusFilter('published'); setShowStatusMenu(false); }}
                className="w-full px-4 py-2 text-left text-white hover:bg-slate-700"
              >
                Published
              </button>
              <button
                onClick={() => { setStatusFilter('draft'); setShowStatusMenu(false); }}
                className="w-full px-4 py-2 text-left text-white hover:bg-slate-700 rounded-b-lg"
              >
                Draft
              </button>
            </div>
          )}
        </div>
        <button
          onClick={() => {
            const next = sortBy === 'newest' ? 'oldest' : sortBy === 'oldest' ? 'alpha' : sortBy === 'alpha' ? 'status' : 'newest';
            setSortBy(next);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white hover:bg-slate-700 transition-colors"
        >
          <ArrowUpDown className="w-4 h-4" />
          {sortBy === 'newest' ? 'Newest' : sortBy === 'oldest' ? 'Oldest' : sortBy === 'alpha' ? 'A-Z' : 'Status'}
        </button>
      </div>

      {selectedIds.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 px-4 py-3 bg-blue-500/10 border border-blue-500/30 rounded-lg"
        >
          <span className="text-blue-400 font-medium">
            {selectedIds.size} article(s) selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
            <div className="relative">
              <button
                onClick={() => setBulkActionOpen(!bulkActionOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm"
              >
                Status
                <ChevronDown className="w-4 h-4" />
              </button>
              {bulkActionOpen && (
                <div className="absolute top-full mt-1 right-0 w-44 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10">
                  <button
                    onClick={() => { handleBulkPublish(true); setBulkActionOpen(false); }}
                    className="w-full px-4 py-2 text-left text-white hover:bg-slate-700 rounded-t-lg flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4 text-green-400" />
                    Publish
                  </button>
                  <button
                    onClick={() => { handleBulkPublish(false); setBulkActionOpen(false); }}
                    className="w-full px-4 py-2 text-left text-white hover:bg-slate-700 rounded-b-lg flex items-center gap-2"
                  >
                    <EyeOff className="w-4 h-4 text-yellow-400" />
                    Unpublish
                  </button>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="ml-auto text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
        </div>
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={handleSelectAll}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      {filteredArticles.length > 0 && filteredArticles.every((a) => selectedIds.has(a.id)) ? (
                        <CheckSquare className="w-5 h-5" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Title</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Words</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Date</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredArticles.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No articles found</p>
                    </td>
                  </tr>
                ) : (
                  filteredArticles.map((article) => (
                    <motion.tr
                      key={article.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors ${
                        selectedIds.has(article.id) ? 'bg-blue-500/5' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleSelectOne(article.id)}
                          className="text-slate-400 hover:text-white transition-colors"
                        >
                          {selectedIds.has(article.id) ? (
                            <CheckSquare className="w-4 h-4" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {article.featuredImage && (
                            <img
                              src={article.featuredImage}
                              alt=""
                              className="w-10 h-10 rounded object-cover"
                            />
                          )}
                          <div>
                            <p className="text-white font-medium">{article.title}</p>
                            {article.tags && article.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {article.tags.slice(0, 2).map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-1.5 py-0.5 bg-slate-700 text-slate-400 text-xs rounded"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {article.tags.length > 2 && (
                                  <span className="text-xs text-slate-500">
                                    +{article.tags.length - 2}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-slate-700 text-slate-300 text-sm rounded">
                          {article.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-slate-400 text-sm flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {getWordCount(article.content)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleQuickToggle(article)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                            article.published
                              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                              : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                          }`}
                        >
                          {article.published ? (
                            <>
                              <Eye className="w-3 h-3" />
                              Published
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" />
                              Draft
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-slate-400 text-sm flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(article.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setPreviewArticle(article);
                              setShowPreview(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-blue-400 transition-colors rounded"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDuplicate(article)}
                            className="p-1.5 text-slate-400 hover:text-green-400 transition-colors rounded"
                            title="Duplicate"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditForm(article)}
                            className="p-1.5 text-slate-400 hover:text-white transition-colors rounded"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(article.id)}
                            className="p-1.5 text-slate-400 hover:text-red-400 transition-colors rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-700">
                <h3 className="text-xl font-bold text-white">
                  {editingArticle ? 'Edit Article' : 'New Article'}
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Excerpt
                  </label>
                  <textarea
                    rows={2}
                    value={formData.excerpt || ''}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="Brief summary of the article..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Content *
                  </label>
                  <textarea
                    required
                    rows={12}
                    value={formData.content || ''}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-blue-500"
                    placeholder="Write your article content here (supports Markdown)..."
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-slate-400">
                      {getWordCount(formData.content || '')} words
                    </span>
                    <span className="text-xs text-slate-500">
                      Supports Markdown formatting
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category || 'Technology'}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Author
                    </label>
                    <input
                      type="text"
                      value={formData.author || ''}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Tags
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                      placeholder="Add tag and press Enter"
                      className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-sm"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-slate-400 hover:text-red-400 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Featured Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.featuredImage || ''}
                    onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                  {formData.featuredImage && (
                    <img
                      src={formData.featuredImage}
                      alt="Preview"
                      className="mt-2 w-32 h-20 object-cover rounded"
                    />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="published"
                    checked={formData.published || false}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded"
                  />
                  <label htmlFor="published" className="text-sm text-slate-300">
                    Publish immediately
                  </label>
                </div>
                <div className="border-t border-slate-700 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium text-slate-300">AI Assistant</span>
                  </div>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="Ask AI to help write content..."
                      className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          generateAiContent();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={generateAiContent}
                      disabled={generatingAi || !aiPrompt.trim()}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                      {generatingAi ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      Generate
                    </button>
                  </div>
                  {aiResponse && (
                    <div className="bg-slate-700/50 rounded-lg p-3 text-sm text-slate-300">
                      {aiResponse}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {editingArticle ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPreview && previewArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-700">
                <h3 className="text-xl font-bold text-white">Article Preview</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                {previewArticle.featuredImage && (
                  <img
                    src={previewArticle.featuredImage}
                    alt={previewArticle.title}
                    className="w-full h-64 object-cover rounded-lg mb-6"
                  />
                )}
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-2xl font-bold text-white">{previewArticle.title}</h2>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      previewArticle.published
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {previewArticle.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div className="flex items-center gap-4 mb-6 text-sm text-slate-400">
                  <span className="flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    {previewArticle.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(previewArticle.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    {getWordCount(previewArticle.content)} words
                  </span>
                </div>
                {previewArticle.excerpt && (
                  <div className="mb-6 p-4 bg-slate-700/50 rounded-lg border-l-4 border-blue-500">
                    <p className="text-slate-300 italic">{previewArticle.excerpt}</p>
                  </div>
                )}
                {previewArticle.tags && previewArticle.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {previewArticle.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-sm flex items-center gap-1"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="prose prose-invert max-w-none">
                  <div className="bg-slate-700/30 rounded-lg p-6">
                    <pre className="whitespace-pre-wrap text-slate-300 font-sans text-sm leading-relaxed">
                      {previewArticle.content}
                    </pre>
                  </div>
                </div>
                {previewArticle.author && (
                  <div className="mt-6 pt-4 border-t border-slate-700">
                    <span className="text-sm text-slate-400">
                      Written by <span className="text-white">{previewArticle.author}</span>
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
