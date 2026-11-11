'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Camera, Plus, Trash2, ExternalLink, RefreshCw, Eye, Sparkles, MoveUp, MoveDown } from 'lucide-react';
import { InstagramSettingsConfig, InstagramPostItem } from '@/types/cms';
import { getInstagramSettings, saveInstagramSettings } from '@/lib/cms/service';
import { defaultInstagramSettings } from '@/lib/cms/defaults';

export function InstagramSettingsForm() {
  const [settings, setSettings] = React.useState<InstagramSettingsConfig>(defaultInstagramSettings);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'edit' | 'preview'>('edit');

  React.useEffect(() => {
    async function loadData() {
      try {
        const data = await getInstagramSettings();
        setSettings(data);
      } catch (err) {
        console.error('Failed to load Instagram settings:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleFieldChange = (key: keyof InstagramSettingsConfig, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handlePostChange = (index: number, key: keyof InstagramPostItem, value: any) => {
    setSettings((prev) => {
      const updatedPosts = [...prev.posts];
      updatedPosts[index] = {
        ...updatedPosts[index],
        [key]: value,
      };
      return {
        ...prev,
        posts: updatedPosts,
      };
    });
  };

  const handleAddPost = () => {
    const newPost: InstagramPostItem = {
      id: `ig-${Date.now()}`,
      imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop',
      postUrl: `https://instagram.com/p/${Date.now()}`,
      caption: 'New Fashion Showcase',
      likesCount: 500,
    };
    setSettings((prev) => ({
      ...prev,
      posts: [...prev.posts, newPost],
    }));
    toast.info('Added new showcase post item');
  };

  const handleRemovePost = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      posts: prev.posts.filter((_, i) => i !== index),
    }));
    toast.info('Post item removed');
  };

  const handleMovePost = (index: number, direction: 'up' | 'down') => {
    setSettings((prev) => {
      const updated = [...prev.posts];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= updated.length) return prev;
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return { ...prev, posts: updated };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const success = await saveInstagramSettings(settings);
      if (success) {
        toast.success('Instagram & Showcase post settings saved successfully!');
      } else {
        toast.error('Failed to save settings.');
      }
    } catch (err) {
      toast.error('An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 text-slate-500 text-sm">
        <RefreshCw className="h-5 w-5 animate-spin mr-2" />
        Loading Instagram configuration...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-slate-900 py-2 max-w-4xl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-slate-900 text-white flex items-center justify-center">
            <Camera className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 uppercase tracking-tight font-heading">
              Instagram & Social Showcase Settings
            </h3>
            <p className="text-xs text-slate-500">
              Configure brand `@HANDLE`, social follow link, and showcase gallery posts.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
              activeTab === 'edit'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Edit Settings
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'preview'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            Live Preview
          </button>
        </div>
      </div>

      {activeTab === 'preview' ? (
        /* Live Preview Component Card */
        <div className="flex flex-col gap-4 p-6 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Storefront Social Showcase Component Preview
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {settings.enabled ? '● Status: Active' : '○ Status: Hidden'}
            </span>
          </div>

          <div className="p-6 bg-white border border-slate-200 rounded-lg">
            {/* Screenshot Matching Header */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight font-heading uppercase">
                {settings.handle || '@LEXIDO'}
              </h2>
              <a
                href={settings.followUrl || '#'}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-950 transition-colors flex items-center gap-1"
              >
                FOLLOW US —
              </a>
            </div>

            {/* Post Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {settings.posts.map((post, idx) => (
                <div key={post.id || idx} className="group relative aspect-square rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                  <img
                    src={post.imageUrl || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=400&auto=format&fit=crop'}
                    alt={post.caption || 'Instagram Post'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-2 text-center">
                    <Camera className="w-5 h-5 mb-1" />
                    {post.caption && (
                      <span className="text-[10px] font-medium line-clamp-2 leading-tight">
                        {post.caption}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Edit Form */
        <form onSubmit={handleSave} className="flex flex-col gap-6">
          {/* Main Controls Section */}
          <div className="flex flex-col gap-5 p-5 rounded-xl border border-slate-200 bg-slate-50/60">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading">
                  Showcase Feed Configuration
                </label>
                <p className="text-xs text-slate-500">
                  Manage main social handle and global direct URL.
                </p>
              </div>

              {/* Toggle switch */}
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs font-bold text-slate-700">
                  {settings.enabled ? 'Enabled' : 'Disabled'}
                </span>
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => handleFieldChange('enabled', e.target.checked)}
                  className="h-4 w-4 rounded text-slate-950 focus:ring-slate-950 cursor-pointer accent-slate-950"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Instagram Handle Header
                </label>
                <input
                  type="text"
                  value={settings.handle}
                  onChange={(e) => handleFieldChange('handle', e.target.value)}
                  placeholder="@LEXIDO"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 font-bold focus:outline-none focus:border-slate-950 h-10"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Follow Link URL
                </label>
                <input
                  type="url"
                  value={settings.followUrl}
                  onChange={(e) => handleFieldChange('followUrl', e.target.value)}
                  placeholder="https://instagram.com/lexido"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-none focus:border-slate-950 h-10"
                />
              </div>
            </div>
          </div>

          {/* Showcase Posts Manager */}
          <div className="flex flex-col gap-4 p-5 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading">
                  Showcase Posts List ({settings.posts.length} items)
                </h4>
                <p className="text-xs text-slate-500">
                  Individual images and links displayed on the home page social showcase section.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddPost}
                className="px-3 py-1.5 bg-slate-950 text-white hover:bg-slate-800 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Post Item
              </button>
            </div>

            {settings.posts.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-xs">
                No showcase posts added yet. Click "Add Post Item" above to add images.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {settings.posts.map((post, idx) => (
                  <div
                    key={post.id || idx}
                    className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-200 shrink-0 relative border border-slate-300">
                      <img
                        src={post.imageUrl || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=400&auto=format&fit=crop'}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1 rounded font-mono">
                        #{idx + 1}
                      </span>
                    </div>

                    {/* Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 flex-1 w-full">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase">
                          Image URL
                        </label>
                        <input
                          type="text"
                          value={post.imageUrl}
                          onChange={(e) => handlePostChange(idx, 'imageUrl', e.target.value)}
                          className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-slate-950 font-mono"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase">
                          Post Link URL
                        </label>
                        <input
                          type="text"
                          value={post.postUrl || ''}
                          onChange={(e) => handlePostChange(idx, 'postUrl', e.target.value)}
                          placeholder="https://instagram.com/p/..."
                          className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-slate-950 font-mono"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase">
                          Caption / Title
                        </label>
                        <input
                          type="text"
                          value={post.caption || ''}
                          onChange={(e) => handlePostChange(idx, 'caption', e.target.value)}
                          placeholder="Lookbook 2026..."
                          className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-slate-950"
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0 self-end md:self-center">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMovePost(idx, 'up')}
                        title="Move Up"
                        className="p-1.5 text-slate-400 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                      >
                        <MoveUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === settings.posts.length - 1}
                        onClick={() => handleMovePost(idx, 'down')}
                        title="Move Down"
                        className="p-1.5 text-slate-400 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                      >
                        <MoveDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemovePost(idx)}
                        title="Delete Post"
                        className="p-1.5 text-rose-500 hover:text-rose-700 cursor-pointer ml-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full h-11 bg-slate-950 text-white hover:bg-slate-900 font-bold uppercase text-xs rounded-xl cursor-pointer select-none transition-all disabled:opacity-50 shadow-sm flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Saving Instagram & Showcase Settings...
              </>
            ) : (
              'Save Instagram & Showcase Configuration'
            )}
          </button>
        </form>
      )}
    </div>
  );
}

export default InstagramSettingsForm;
