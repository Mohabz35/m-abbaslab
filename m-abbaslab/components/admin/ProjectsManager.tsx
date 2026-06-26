'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  GripVertical,
  Save,
  X,
  Upload,
  FileText,
  Eye,
  Copy,
  Download,
  Search,
  Filter,
  ArrowUpDown,
  CheckSquare,
  Square,
  ChevronDown,
  Sparkles,
  Tag,
  ExternalLink,
  Calendar,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';

interface Project {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  status: 'planning' | 'in-progress' | 'shipped';
  category: string;
  technologies: string[];
  imageUrl?: string;
  githubUrl?: string;
  liveUrl?: string;
  featured?: boolean;
  aiInsights?: {
    complexity?: string;
    estimatedTime?: string;
    suggestions?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

interface ProjectsManagerProps {
  initialProjects?: Project[];
}

const STATUS_CONFIG = {
  planning: { label: 'Planning', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  'in-progress': { label: 'In Progress', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  shipped: { label: 'Shipped', color: 'bg-green-500/20 text-green-400 border-green-500/30' }
};

const CATEGORIES = ['Web App', 'Mobile', 'API', 'CLI Tool', 'Library', 'Desktop', 'AI/ML', 'DevOps', 'Other'];

export default function ProjectsManager({ initialProjects = [] }: ProjectsManagerProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previewProject, setPreviewProject] = useState<Project | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState<Partial<Project>>({});
  const [uploading, setUploading] = useState(false);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [generatingInsights, setGeneratingInsights] = useState(false);
  const [techInput, setTechInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'alpha' | 'status'>('newest');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [bulkActionOpen, setBulkActionOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || data || []);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects
    .filter((p) => {
      const matchesSearch =
        searchQuery === '' ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.technologies?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
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
          const order = { planning: 0, 'in-progress': 1, shipped: 2 };
          return (order[a.status] || 0) - (order[b.status] || 0);
        default:
          return 0;
      }
    });

  const columns = {
    planning: filteredProjects.filter((p) => p.status === 'planning'),
    'in-progress': filteredProjects.filter((p) => p.status === 'in-progress'),
    shipped: filteredProjects.filter((p) => p.status === 'shipped')
  };

  const handleSelectAll = (status: string) => {
    const columnProjects = columns[status as keyof typeof columns] || [];
    const allSelected = columnProjects.every((p) => selectedIds.has(p.id));
    const newSelected = new Set(selectedIds);
    if (allSelected) {
      columnProjects.forEach((p) => newSelected.delete(p.id));
    } else {
      columnProjects.forEach((p) => newSelected.add(p.id));
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
    if (!confirm(`Delete ${selectedIds.size} project(s)?`)) return;
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          fetch(`/api/admin/projects/${id}`, { method: 'DELETE' })
        )
      );
      setProjects(projects.filter((p) => !selectedIds.has(p.id)));
      setSelectedIds(new Set());
    } catch (error) {
      console.error('Bulk delete failed:', error);
    }
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          fetch(`/api/admin/projects/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
          })
        )
      );
      setProjects(
        projects.map((p) =>
          selectedIds.has(p.id) ? { ...p, status: newStatus as Project['status'] } : p
        )
      );
      setSelectedIds(new Set());
    } catch (error) {
      console.error('Bulk status change failed:', error);
    }
  };

  const handleDuplicate = async (project: Project) => {
    try {
      const res = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...project,
          id: undefined,
          title: `${project.title} (Copy)`,
          createdAt: undefined,
          updatedAt: undefined
        })
      });
      if (res.ok) {
        const newProject = await res.json();
        setProjects([...projects, newProject]);
      }
    } catch (error) {
      console.error('Duplicate failed:', error);
    }
  };

  const handleExport = () => {
    const exportData = selectedIds.size > 0
      ? projects.filter((p) => selectedIds.has(p.id))
      : filteredProjects;
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `projects-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formDataObj });
      if (res.ok) {
        const data = await res.json();
        setFormData({ ...formData, imageUrl: data.url });
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingProject ? 'PATCH' : 'POST';
      const url = editingProject
        ? `/api/admin/projects/${editingProject.id}`
        : '/api/admin/projects';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const saved = await res.json();
        if (editingProject) {
          setProjects(projects.map((p) => (p.id === editingProject.id ? saved : p)));
        } else {
          setProjects([...projects, saved]);
        }
        setShowForm(false);
        setEditingProject(null);
        setFormData({});
        setAiInsights(null);
      }
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    try {
      const res = await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects(projects.filter((p) => p.id !== id));
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const generateAiInsights = async () => {
    setGeneratingInsights(true);
    try {
      const res = await fetch('/api/admin/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          technologies: formData.technologies
        })
      });
      if (res.ok) {
        const insights = await res.json();
        setAiInsights(insights);
      }
    } catch (error) {
      console.error('AI insights failed:', error);
    } finally {
      setGeneratingInsights(false);
    }
  };

  const addTechTag = () => {
    if (techInput.trim() && !formData.technologies?.includes(techInput.trim())) {
      setFormData({
        ...formData,
        technologies: [...(formData.technologies || []), techInput.trim()]
      });
      setTechInput('');
    }
  };

  const removeTechTag = (tag: string) => {
    setFormData({
      ...formData,
      technologies: formData.technologies?.filter((t) => t !== tag) || []
    });
  };

  const openEditForm = (project: Project) => {
    setEditingProject(project);
    setFormData({ ...project });
    setShowForm(true);
    setAiInsights(null);
  };

  const openNewForm = () => {
    setEditingProject(null);
    setFormData({
      title: '',
      description: '',
      longDescription: '',
      status: 'planning',
      category: 'Web App',
      technologies: [],
      imageUrl: '',
      githubUrl: '',
      liveUrl: '',
      featured: false
    });
    setShowForm(true);
    setAiInsights(null);
  };

  const renderColumn = (status: keyof typeof STATUS_CONFIG, title: string) => {
    const items = columns[status];
    const allSelected = items.length > 0 && items.every((p) => selectedIds.has(p.id));
    const someSelected = items.some((p) => selectedIds.has(p.id));

    return (
      <div key={status} className="flex-1 min-w-[320px]">
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSelectAll(status)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              {allSelected ? (
                <CheckSquare className="w-5 h-5" />
              ) : someSelected ? (
                <div className="w-5 h-5 border-2 border-blue-500 rounded bg-blue-500/20" />
              ) : (
                <Square className="w-5 h-5" />
              )}
            </button>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <span className="text-sm text-slate-400 bg-slate-700 px-2 py-0.5 rounded-full">
              {items.length}
            </span>
          </div>
        </div>
        <div className="space-y-3">
          {items.map((project) => (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`bg-slate-800 border rounded-lg p-4 cursor-pointer hover:border-slate-600 transition-all ${
                selectedIds.has(project.id) ? 'border-blue-500 bg-blue-500/5' : 'border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectOne(project.id);
                    }}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {selectedIds.has(project.id) ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                  <GripVertical className="w-4 h-4 text-slate-500" />
                  {project.featured && (
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewProject(project);
                      setShowPreview(true);
                    }}
                    className="p-1 text-slate-400 hover:text-blue-400 transition-colors"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicate(project);
                    }}
                    className="p-1 text-slate-400 hover:text-green-400 transition-colors"
                    title="Duplicate"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditForm(project);
                    }}
                    className="p-1 text-slate-400 hover:text-white transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(project.id);
                    }}
                    className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {project.imageUrl && (
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="w-full h-32 object-cover rounded mb-3"
                />
              )}
              <h4 className="font-semibold text-white mb-1">{project.title}</h4>
              <p className="text-sm text-slate-400 mb-3 line-clamp-2">{project.description}</p>
              {project.technologies && project.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {project.technologies.slice(0, 4).map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded-full flex items-center gap-1"
                    >
                      <Tag className="w-3 h-3" />
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 4 && (
                    <span className="px-2 py-0.5 bg-slate-700 text-slate-400 text-xs rounded-full">
                      +{project.technologies.length - 4}
                    </span>
                  )}
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-white transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
              {project.aiInsights && (
                <div className="mt-3 p-2 bg-slate-700/50 rounded border border-slate-600">
                  <div className="flex items-center gap-1 text-xs text-purple-400 mb-1">
                    <Sparkles className="w-3 h-3" />
                    AI Insights
                  </div>
                  <div className="text-xs text-slate-400">
                    {project.aiInsights.complexity && (
                      <span>Complexity: {project.aiInsights.complexity}</span>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Projects Manager</h2>
          <p className="text-slate-400 text-sm mt-1">
            Manage your projects with Kanban board
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
            Add Project
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects by title, description, category, or tech..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white hover:bg-slate-700 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Status: {statusFilter === 'all' ? 'All' : STATUS_CONFIG[statusFilter as keyof typeof STATUS_CONFIG]?.label}
            <ChevronDown className="w-4 h-4" />
          </button>
          {showFilterMenu && (
            <div className="absolute top-full mt-1 left-0 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10">
              <button
                onClick={() => { setStatusFilter('all'); setShowFilterMenu(false); }}
                className="w-full px-4 py-2 text-left text-white hover:bg-slate-700 rounded-t-lg"
              >
                All
              </button>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => { setStatusFilter(key); setShowFilterMenu(false); }}
                  className="w-full px-4 py-2 text-left text-white hover:bg-slate-700 last:rounded-b-lg"
                >
                  {config.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="relative">
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
      </div>

      {selectedIds.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 px-4 py-3 bg-blue-500/10 border border-blue-500/30 rounded-lg"
        >
          <span className="text-blue-400 font-medium">
            {selectedIds.size} project(s) selected
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
                Change Status
                <ChevronDown className="w-4 h-4" />
              </button>
              {bulkActionOpen && (
                <div className="absolute top-full mt-1 right-0 w-44 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10">
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => {
                        handleBulkStatusChange(key);
                        setBulkActionOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-white hover:bg-slate-700 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {config.label}
                    </button>
                  ))}
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

      <div className="flex gap-6 overflow-x-auto pb-4">
        {loading ? (
          <div className="flex items-center justify-center w-full py-20">
            <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
          </div>
        ) : (
          <>
            {renderColumn('planning', 'Planning')}
            {renderColumn('in-progress', 'In Progress')}
            {renderColumn('shipped', 'Shipped')}
          </>
        )}
      </div>

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
              className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-700">
                <h3 className="text-xl font-bold text-white">
                  {editingProject ? 'Edit Project' : 'New Project'}
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
                    Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Long Description
                  </label>
                  <textarea
                    rows={5}
                    value={formData.longDescription || ''}
                    onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status || 'planning'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as Project['status'] })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category || 'Web App'}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Technologies
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={techInput}
                      onChange={(e) => setTechInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTechTag();
                        }
                      }}
                      placeholder="Add technology and press Enter"
                      className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={addTechTag}
                      className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.technologies?.map((tech) => (
                      <span
                        key={tech}
                        className="flex items-center gap-1 px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-sm"
                      >
                        <Tag className="w-3 h-3" />
                        {tech}
                        <button
                          type="button"
                          onClick={() => removeTechTag(tech)}
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
                    Image
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50"
                    >
                      {uploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      {uploading ? 'Uploading...' : 'Upload Image'}
                    </button>
                    {formData.imageUrl && (
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      GitHub URL
                    </label>
                    <input
                      type="url"
                      value={formData.githubUrl || ''}
                      onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Live URL
                    </label>
                    <input
                      type="url"
                      value={formData.liveUrl || ''}
                      onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured || false}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded"
                  />
                  <label htmlFor="featured" className="text-sm text-slate-300">
                    Featured Project
                  </label>
                </div>
                <div className="border-t border-slate-700 pt-4 mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      AI Insights
                    </h4>
                    <button
                      type="button"
                      onClick={generateAiInsights}
                      disabled={generatingInsights || !formData.title || !formData.description}
                      className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm disabled:opacity-50"
                    >
                      {generatingInsights ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                      {generatingInsights ? 'Generating...' : 'Generate Insights'}
                    </button>
                  </div>
                  {aiInsights && (
                    <div className="bg-slate-700/50 rounded-lg p-4 space-y-3">
                      {aiInsights.complexity && (
                        <div>
                          <span className="text-xs text-slate-400">Complexity:</span>
                          <span className="ml-2 text-white">{aiInsights.complexity}</span>
                        </div>
                      )}
                      {aiInsights.estimatedTime && (
                        <div>
                          <span className="text-xs text-slate-400">Estimated Time:</span>
                          <span className="ml-2 text-white">{aiInsights.estimatedTime}</span>
                        </div>
                      )}
                      {aiInsights.suggestions && aiInsights.suggestions.length > 0 && (
                        <div>
                          <span className="text-xs text-slate-400">Suggestions:</span>
                          <ul className="mt-1 space-y-1">
                            {aiInsights.suggestions.map((s: string, i: number) => (
                              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                                <span className="text-purple-400">•</span>
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {editingProject ? 'Update' : 'Create'}
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
        {showPreview && previewProject && (
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
                <h3 className="text-xl font-bold text-white">Project Preview</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                {previewProject.imageUrl && (
                  <img
                    src={previewProject.imageUrl}
                    alt={previewProject.title}
                    className="w-full h-64 object-cover rounded-lg mb-6"
                  />
                )}
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-2xl font-bold text-white">{previewProject.title}</h2>
                  <span className={`px-3 py-1 rounded-full text-sm border ${STATUS_CONFIG[previewProject.status].color}`}>
                    {STATUS_CONFIG[previewProject.status].label}
                  </span>
                  {previewProject.featured && (
                    <span className="flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm border border-yellow-500/30">
                      <Sparkles className="w-3 h-3" />
                      Featured
                    </span>
                  )}
                </div>
                <p className="text-slate-300 mb-4">{previewProject.description}</p>
                {previewProject.longDescription && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-slate-400 mb-2">Details</h4>
                    <p className="text-slate-300 whitespace-pre-wrap">{previewProject.longDescription}</p>
                  </div>
                )}
                {previewProject.technologies && previewProject.technologies.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-slate-400 mb-2">Technologies</h4>
                    <div className="flex flex-wrap gap-2">
                      {previewProject.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-sm flex items-center gap-1"
                        >
                          <Tag className="w-3 h-3" />
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <span className="text-xs text-slate-400 block mb-1">Category</span>
                    <span className="text-white">{previewProject.category}</span>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <span className="text-xs text-slate-400 block mb-1">Created</span>
                    <span className="text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(previewProject.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {(previewProject.githubUrl || previewProject.liveUrl) && (
                  <div className="flex items-center gap-3">
                    {previewProject.githubUrl && (
                      <a
                        href={previewProject.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        GitHub
                      </a>
                    )}
                    {previewProject.liveUrl && (
                      <a
                        href={previewProject.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Live Demo
                      </a>
                    )}
                  </div>
                )}
                {previewProject.aiInsights && (
                  <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <h4 className="text-sm font-medium text-purple-400 flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4" />
                      AI Insights
                    </h4>
                    <div className="space-y-2">
                      {previewProject.aiInsights.complexity && (
                        <div className="text-sm">
                          <span className="text-slate-400">Complexity:</span>
                          <span className="ml-2 text-white">{previewProject.aiInsights.complexity}</span>
                        </div>
                      )}
                      {previewProject.aiInsights.estimatedTime && (
                        <div className="text-sm">
                          <span className="text-slate-400">Estimated Time:</span>
                          <span className="ml-2 text-white">{previewProject.aiInsights.estimatedTime}</span>
                        </div>
                      )}
                      {previewProject.aiInsights.suggestions && previewProject.aiInsights.suggestions.length > 0 && (
                        <div>
                          <span className="text-sm text-slate-400">Suggestions:</span>
                          <ul className="mt-1 space-y-1">
                            {previewProject.aiInsights.suggestions.map((s: string, i: number) => (
                              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                                <span className="text-purple-400">•</span>
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
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
