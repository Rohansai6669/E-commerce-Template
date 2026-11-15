'use client';

import * as React from 'react';
import {
  HelpCenterConfig,
  FaqConfig,
  ShippingPolicyConfig,
  ReturnsPolicyConfig,
  PrivacyPolicyConfig,
  SupportTicketConfig,
  TrackOrderConfig,
} from '@/types/help-pages';
import {
  getHelpCenterConfigServer,
  saveHelpCenterConfigAction,
  getFaqConfigServer,
  saveFaqConfigAction,
  getShippingPolicyConfigServer,
  saveShippingPolicyConfigAction,
  getReturnsPolicyConfigServer,
  saveReturnsPolicyConfigAction,
  getPrivacyPolicyConfigServer,
  savePrivacyPolicyConfigAction,
  getSupportTicketConfigServer,
  saveSupportTicketConfigAction,
  getTrackOrderConfigServer,
  saveTrackOrderConfigAction,
} from '@/app/actions/help-cms-actions';
import {
  defaultHelpCenterConfig,
  defaultFaqConfig,
  defaultShippingPolicyConfig,
  defaultReturnsPolicyConfig,
  defaultPrivacyPolicyConfig,
  defaultSupportTicketConfig,
  defaultTrackOrderConfig,
} from '@/lib/cms/help-pages-defaults';
import {
  HelpCircle,
  FileQuestion,
  Truck,
  RotateCcw,
  Shield,
  LifeBuoy,
  MapPin,
  Save,
  Plus,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

type HelpPageTab =
  | 'help_center'
  | 'faqs'
  | 'shipping'
  | 'returns'
  | 'privacy'
  | 'support'
  | 'track_order';

export function HelpPagesManager() {
  const [activeTab, setActiveTab] = React.useState<HelpPageTab>('help_center');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  // State configurations
  const [helpCenter, setHelpCenter] = React.useState<HelpCenterConfig>(defaultHelpCenterConfig);
  const [faq, setFaq] = React.useState<FaqConfig>(defaultFaqConfig);
  const [shipping, setShipping] = React.useState<ShippingPolicyConfig>(defaultShippingPolicyConfig);
  const [returns, setReturns] = React.useState<ReturnsPolicyConfig>(defaultReturnsPolicyConfig);
  const [privacy, setPrivacy] = React.useState<PrivacyPolicyConfig>(defaultPrivacyPolicyConfig);
  const [support, setSupport] = React.useState<SupportTicketConfig>(defaultSupportTicketConfig);
  const [trackOrder, setTrackOrder] = React.useState<TrackOrderConfig>(defaultTrackOrderConfig);

  // Load all configurations on mount
  React.useEffect(() => {
    async function loadAll() {
      setIsLoading(true);
      try {
        const [hc, fq, sh, rt, pr, sp, tr] = await Promise.all([
          getHelpCenterConfigServer(),
          getFaqConfigServer(),
          getShippingPolicyConfigServer(),
          getReturnsPolicyConfigServer(),
          getPrivacyPolicyConfigServer(),
          getSupportTicketConfigServer(),
          getTrackOrderConfigServer(),
        ]);
        setHelpCenter(hc);
        setFaq(fq);
        setShipping(sh);
        setReturns(rt);
        setPrivacy(pr);
        setSupport(sp);
        setTrackOrder(tr);
      } catch (err) {
        console.error('Failed to load help pages configs:', err);
        toast.error('Failed to load page configurations from database.');
      } finally {
        setIsLoading(false);
      }
    }
    loadAll();
  }, []);

  // Save handler per tab
  const handleSaveActive = async () => {
    setIsSaving(true);
    try {
      let res = { success: true };
      if (activeTab === 'help_center') {
        res = await saveHelpCenterConfigAction(helpCenter);
      } else if (activeTab === 'faqs') {
        res = await saveFaqConfigAction(faq);
      } else if (activeTab === 'shipping') {
        res = await saveShippingPolicyConfigAction(shipping);
      } else if (activeTab === 'returns') {
        res = await saveReturnsPolicyConfigAction(returns);
      } else if (activeTab === 'privacy') {
        res = await savePrivacyPolicyConfigAction(privacy);
      } else if (activeTab === 'support') {
        res = await saveSupportTicketConfigAction(support);
      } else if (activeTab === 'track_order') {
        res = await saveTrackOrderConfigAction(trackOrder);
      }

      if (res.success) {
        toast.success(`Successfully saved and published ${activeTab.replace('_', ' ').toUpperCase()}!`);
      } else {
        toast.error('Failed to save changes to database.');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Unexpected error while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 gap-3 text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin text-slate-900" />
        <span className="text-xs font-mono uppercase tracking-widest">
          Retrieving Page Data From Database...
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner and Navigation Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-500">
            DYNAMIC STORE CONTENT
          </span>
          <h2 className="text-xl font-black uppercase tracking-tight text-slate-950 font-heading">
            Help & Policy Pages Manager
          </h2>
          <p className="text-xs text-slate-500">
            Customize content, policies, questions, and contact hours for customer care pages.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Live Preview Button */}
          {activeTab === 'help_center' && (
            <a
              href="/help"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-none inline-flex items-center gap-1.5 transition-colors"
            >
              Preview /help <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          {activeTab === 'faqs' && (
            <a
              href="/faq"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-none inline-flex items-center gap-1.5 transition-colors"
            >
              Preview /faq <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          {activeTab === 'shipping' && (
            <a
              href="/shipping"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-none inline-flex items-center gap-1.5 transition-colors"
            >
              Preview /shipping <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          {activeTab === 'returns' && (
            <a
              href="/returns"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-none inline-flex items-center gap-1.5 transition-colors"
            >
              Preview /returns <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          {activeTab === 'privacy' && (
            <a
              href="/privacy"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-none inline-flex items-center gap-1.5 transition-colors"
            >
              Preview /privacy <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          {activeTab === 'support' && (
            <a
              href="/support"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-none inline-flex items-center gap-1.5 transition-colors"
            >
              Preview /support <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          {activeTab === 'track_order' && (
            <a
              href="/track-order"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-none inline-flex items-center gap-1.5 transition-colors"
            >
              Preview /track-order <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSaveActive}
            disabled={isSaving}
            className="px-5 py-2 bg-slate-950 text-white text-xs font-bold uppercase tracking-wider hover:bg-slate-800 disabled:opacity-50 inline-flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save Changes
          </button>
        </div>
      </div>

      {/* 7 Page Selection Sub-tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { key: 'help_center', label: '1. Help Center (/help)', icon: HelpCircle },
          { key: 'track_order', label: '2. Track Order (/track-order)', icon: MapPin },
          { key: 'faqs', label: '3. FAQs (/faq)', icon: FileQuestion },
          { key: 'support', label: '4. Raise Ticket (/support)', icon: LifeBuoy },
          { key: 'shipping', label: '5. Shipping Policy (/shipping)', icon: Truck },
          { key: 'returns', label: '6. Returns Policy (/returns)', icon: RotateCcw },
          { key: 'privacy', label: '7. Privacy Policy (/privacy)', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as HelpPageTab)}
              className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 border transition-colors cursor-pointer ${
                isActive
                  ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Help Center */}
      {activeTab === 'help_center' && (
        <div className="flex flex-col gap-6 bg-white border border-slate-200 p-6 sm:p-8">
          <div className="flex flex-col gap-1 border-b border-slate-100 pb-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 font-heading">
              Help Center Configuration
            </h3>
            <p className="text-xs text-slate-500">
              Settings for the main /help landing hub, client concierge contacts, and category action cards.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Hero Title</label>
              <input
                type="text"
                value={helpCenter.heroTitle}
                onChange={(e) => setHelpCenter({ ...helpCenter, heroTitle: e.target.value })}
                className="w-full border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Hero Subtitle</label>
              <input
                type="text"
                value={helpCenter.heroSubtitle}
                onChange={(e) => setHelpCenter({ ...helpCenter, heroSubtitle: e.target.value })}
                className="w-full border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Support Email</label>
              <input
                type="text"
                value={helpCenter.supportEmail}
                onChange={(e) => setHelpCenter({ ...helpCenter, supportEmail: e.target.value })}
                className="w-full border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Support Phone</label>
              <input
                type="text"
                value={helpCenter.supportPhone}
                onChange={(e) => setHelpCenter({ ...helpCenter, supportPhone: e.target.value })}
                className="w-full border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Working Hours Notice</label>
              <input
                type="text"
                value={helpCenter.workingHours}
                onChange={(e) => setHelpCenter({ ...helpCenter, workingHours: e.target.value })}
                className="w-full border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          {/* Quick Action Cards List */}
          <div className="flex flex-col gap-4 border-t border-slate-100 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Quick Action Cards ({helpCenter.quickCards.length})
                </h4>
                <p className="text-[11px] text-slate-500">Cards rendered in grid on /help</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newCard = {
                    id: `qc-${Date.now()}`,
                    title: 'New Service Card',
                    description: 'Description of the service or policy.',
                    href: '/contact',
                  };
                  setHelpCenter({ ...helpCenter, quickCards: [...helpCenter.quickCards, newCard] });
                }}
                className="px-3 py-1.5 text-xs font-bold uppercase bg-slate-100 hover:bg-slate-200 text-slate-800 inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Card
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {helpCenter.quickCards.map((card, idx) => (
                <div key={card.id} className="border border-slate-200 p-4 bg-slate-50 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400">Card 0{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setHelpCenter({
                          ...helpCenter,
                          quickCards: helpCenter.quickCards.filter((c) => c.id !== card.id),
                        });
                      }}
                      className="text-rose-500 hover:text-rose-700 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={card.title}
                    onChange={(e) => {
                      const updated = [...helpCenter.quickCards];
                      updated[idx].title = e.target.value;
                      setHelpCenter({ ...helpCenter, quickCards: updated });
                    }}
                    placeholder="Card Title"
                    className="border border-slate-200 bg-white p-2 text-xs font-bold"
                  />
                  <input
                    type="text"
                    value={card.description}
                    onChange={(e) => {
                      const updated = [...helpCenter.quickCards];
                      updated[idx].description = e.target.value;
                      setHelpCenter({ ...helpCenter, quickCards: updated });
                    }}
                    placeholder="Card Description"
                    className="border border-slate-200 bg-white p-2 text-xs"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={card.href}
                      onChange={(e) => {
                        const updated = [...helpCenter.quickCards];
                        updated[idx].href = e.target.value;
                        setHelpCenter({ ...helpCenter, quickCards: updated });
                      }}
                      placeholder="Href e.g. /track-order"
                      className="border border-slate-200 bg-white p-2 text-xs font-mono"
                    />
                    <input
                      type="text"
                      value={card.badge || ''}
                      onChange={(e) => {
                        const updated = [...helpCenter.quickCards];
                        updated[idx].badge = e.target.value;
                        setHelpCenter({ ...helpCenter, quickCards: updated });
                      }}
                      placeholder="Optional Badge"
                      className="border border-slate-200 bg-white p-2 text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Track Order */}
      {activeTab === 'track_order' && (
        <div className="flex flex-col gap-6 bg-white border border-slate-200 p-6 sm:p-8">
          <div className="flex flex-col gap-1 border-b border-slate-100 pb-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 font-heading">
              Track Order Configuration
            </h3>
            <p className="text-xs text-slate-500">
              Customize notice banners and lookup guidelines on /track-order.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Page Headline</label>
              <input
                type="text"
                value={trackOrder.title}
                onChange={(e) => setTrackOrder({ ...trackOrder, title: e.target.value })}
                className="w-full border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Subtitle</label>
              <input
                type="text"
                value={trackOrder.subtitle}
                onChange={(e) => setTrackOrder({ ...trackOrder, subtitle: e.target.value })}
                className="w-full border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Tracking Latency Notice</label>
            <input
              type="text"
              value={trackOrder.lookupNotice}
              onChange={(e) => setTrackOrder({ ...trackOrder, lookupNotice: e.target.value })}
              className="w-full border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Courier Partners Banner</label>
              <input
                type="text"
                value={trackOrder.courierPartnersNotice}
                onChange={(e) => setTrackOrder({ ...trackOrder, courierPartnersNotice: e.target.value })}
                className="w-full border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Concierge Help Link Text</label>
              <input
                type="text"
                value={trackOrder.helpLinkText}
                onChange={(e) => setTrackOrder({ ...trackOrder, helpLinkText: e.target.value })}
                className="w-full border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: FAQs */}
      {activeTab === 'faqs' && (
        <div className="flex flex-col gap-6 bg-white border border-slate-200 p-6 sm:p-8">
          <div className="flex flex-col gap-1 border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 font-heading">
                  Frequently Asked Questions Manager
                </h3>
                <p className="text-xs text-slate-500">
                  Organize FAQ categories, questions, and detailed answers displayed on /faq.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newCategory = {
                    id: `cat-${Date.now()}`,
                    name: 'New Question Category',
                    items: [
                      {
                        id: `faq-${Date.now()}`,
                        question: 'Sample Question Title?',
                        answer: 'Sample detailed answer explaining the policy.',
                      },
                    ],
                  };
                  setFaq({ ...faq, categories: [...faq.categories, newCategory] });
                }}
                className="px-3 py-1.5 text-xs font-bold uppercase bg-slate-950 text-white hover:bg-slate-800 inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Category
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">FAQ Page Title</label>
              <input
                type="text"
                value={faq.title}
                onChange={(e) => setFaq({ ...faq, title: e.target.value })}
                className="w-full border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Subtitle</label>
              <input
                type="text"
                value={faq.subtitle}
                onChange={(e) => setFaq({ ...faq, subtitle: e.target.value })}
                className="w-full border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          {/* Categories and Questions */}
          <div className="flex flex-col gap-6 mt-4">
            {faq.categories.map((category, catIdx) => (
              <div key={category.id} className="border border-slate-200 p-5 bg-slate-50 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2 flex-1 max-w-md">
                    <span className="text-[10px] font-mono font-bold text-slate-400">CATEGORY:</span>
                    <input
                      type="text"
                      value={category.name}
                      onChange={(e) => {
                        const updated = [...faq.categories];
                        updated[catIdx].name = e.target.value;
                        setFaq({ ...faq, categories: updated });
                      }}
                      className="border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-slate-900 flex-1"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...faq.categories];
                        updated[catIdx].items.push({
                          id: `faq-${Date.now()}`,
                          question: 'New Question?',
                          answer: 'Answer content here.',
                        });
                        setFaq({ ...faq, categories: updated });
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold uppercase bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 inline-flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Question
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFaq({
                          ...faq,
                          categories: faq.categories.filter((c) => c.id !== category.id),
                        });
                      }}
                      className="text-rose-500 hover:text-rose-700 p-1"
                      title="Delete category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Items in this category */}
                <div className="flex flex-col gap-3">
                  {category.items.map((item, itemIdx) => (
                    <div key={item.id} className="border border-slate-200 bg-white p-3 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-slate-400">Q0{itemIdx + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...faq.categories];
                            updated[catIdx].items = updated[catIdx].items.filter((i) => i.id !== item.id);
                            setFaq({ ...faq, categories: updated });
                          }}
                          className="text-rose-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={item.question}
                        onChange={(e) => {
                          const updated = [...faq.categories];
                          updated[catIdx].items[itemIdx].question = e.target.value;
                          setFaq({ ...faq, categories: updated });
                        }}
                        placeholder="Question"
                        className="border border-slate-200 p-2 text-xs font-semibold text-slate-900"
                      />
                      <textarea
                        rows={2}
                        value={item.answer}
                        onChange={(e) => {
                          const updated = [...faq.categories];
                          updated[catIdx].items[itemIdx].answer = e.target.value;
                          setFaq({ ...faq, categories: updated });
                        }}
                        placeholder="Answer"
                        className="border border-slate-200 p-2 text-xs text-slate-700 resize-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Support / Raise Ticket */}
      {activeTab === 'support' && (
        <div className="flex flex-col gap-6 bg-white border border-slate-200 p-6 sm:p-8">
          <div className="flex flex-col gap-1 border-b border-slate-100 pb-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 font-heading">
              Support Desk & Ticket Configuration
            </h3>
            <p className="text-xs text-slate-500">
              Settings for the /support ticket intake desk, concierge response guarantee, and categories.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Page Headline</label>
              <input
                type="text"
                value={support.title}
                onChange={(e) => setSupport({ ...support, title: e.target.value })}
                className="w-full border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Subtitle</label>
              <input
                type="text"
                value={support.subtitle}
                onChange={(e) => setSupport({ ...support, subtitle: e.target.value })}
                className="w-full border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Support Desk Email</label>
              <input
                type="text"
                value={support.supportEmail}
                onChange={(e) => setSupport({ ...support, supportEmail: e.target.value })}
                className="w-full border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Working Hours</label>
              <input
                type="text"
                value={support.workingHours}
                onChange={(e) => setSupport({ ...support, workingHours: e.target.value })}
                className="w-full border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">SLA Response Guarantee Notice</label>
            <input
              type="text"
              value={support.slaNotice}
              onChange={(e) => setSupport({ ...support, slaNotice: e.target.value })}
              className="w-full border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
            />
          </div>

          {/* Ticket Categories */}
          <div className="flex flex-col gap-3 border-t border-slate-100 pt-5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Ticket Categories ({support.categories.length})
              </h4>
              <button
                type="button"
                onClick={() => {
                  setSupport({ ...support, categories: [...support.categories, 'New Inquiry Category'] });
                }}
                className="px-2.5 py-1 text-xs font-bold uppercase bg-slate-100 hover:bg-slate-200 text-slate-800 inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Category
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {support.categories.map((cat, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={cat}
                    onChange={(e) => {
                      const updated = [...support.categories];
                      updated[idx] = e.target.value;
                      setSupport({ ...support, categories: updated });
                    }}
                    className="border border-slate-200 p-2 text-xs flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSupport({
                        ...support,
                        categories: support.categories.filter((_, i) => i !== idx),
                      });
                    }}
                    className="text-rose-500 hover:text-rose-700 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Shipping Policy */}
      {activeTab === 'shipping' && (
        <div className="flex flex-col gap-6 bg-white border border-slate-200 p-6 sm:p-8">
          <div className="flex flex-col gap-1 border-b border-slate-100 pb-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 font-heading">
              Shipping & Dispatch Policy Configuration
            </h3>
            <p className="text-xs text-slate-500">
              Customize freight thresholds, timelines, logistics carriers, and clauses on /shipping.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Headline</label>
              <input
                type="text"
                value={shipping.title}
                onChange={(e) => setShipping({ ...shipping, title: e.target.value })}
                className="w-full border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Subtitle</label>
              <input
                type="text"
                value={shipping.subtitle}
                onChange={(e) => setShipping({ ...shipping, subtitle: e.target.value })}
                className="w-full border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Free Ship Above (₹)</label>
              <input
                type="number"
                value={shipping.freeShippingThreshold}
                onChange={(e) => setShipping({ ...shipping, freeShippingThreshold: Number(e.target.value) })}
                className="w-full border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Standard Rate (₹)</label>
              <input
                type="number"
                value={shipping.standardRate}
                onChange={(e) => setShipping({ ...shipping, standardRate: Number(e.target.value) })}
                className="w-full border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Metro Timelines</label>
              <input
                type="text"
                value={shipping.metroDeliveryTime}
                onChange={(e) => setShipping({ ...shipping, metroDeliveryTime: e.target.value })}
                className="w-full border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">National Timelines</label>
              <input
                type="text"
                value={shipping.nationalDeliveryTime}
                onChange={(e) => setShipping({ ...shipping, nationalDeliveryTime: e.target.value })}
                className="w-full border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          {/* Policy Sections */}
          <div className="flex flex-col gap-4 border-t border-slate-100 pt-5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Editorial Clauses ({shipping.sections.length})
              </h4>
              <button
                type="button"
                onClick={() => {
                  const newSec = {
                    id: `sec-${Date.now()}`,
                    heading: 'New Shipping Guideline',
                    content: 'Policy clause explanation.',
                  };
                  setShipping({ ...shipping, sections: [...shipping.sections, newSec] });
                }}
                className="px-2.5 py-1 text-xs font-bold uppercase bg-slate-100 hover:bg-slate-200 text-slate-800 inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Clause
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {shipping.sections.map((sec, idx) => (
                <div key={sec.id} className="border border-slate-200 p-4 bg-slate-50 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400">Clause 0{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setShipping({
                          ...shipping,
                          sections: shipping.sections.filter((s) => s.id !== sec.id),
                        });
                      }}
                      className="text-rose-500 hover:text-rose-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={sec.heading}
                    onChange={(e) => {
                      const updated = [...shipping.sections];
                      updated[idx].heading = e.target.value;
                      setShipping({ ...shipping, sections: updated });
                    }}
                    placeholder="Section Heading"
                    className="border border-slate-200 bg-white p-2 text-xs font-bold"
                  />
                  <textarea
                    rows={3}
                    value={sec.content}
                    onChange={(e) => {
                      const updated = [...shipping.sections];
                      updated[idx].content = e.target.value;
                      setShipping({ ...shipping, sections: updated });
                    }}
                    placeholder="Section Content"
                    className="border border-slate-200 bg-white p-2 text-xs resize-none"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Returns Policy */}
      {activeTab === 'returns' && (
        <div className="flex flex-col gap-6 bg-white border border-slate-200 p-6 sm:p-8">
          <div className="flex flex-col gap-1 border-b border-slate-100 pb-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 font-heading">
              Returns & Exchanges Policy Configuration
            </h3>
            <p className="text-xs text-slate-500">
              Customize the return window (15 days), pickup SLA, conditions checklist, and clauses on /returns.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Headline</label>
              <input
                type="text"
                value={returns.title}
                onChange={(e) => setReturns({ ...returns, title: e.target.value })}
                className="w-full border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Subtitle</label>
              <input
                type="text"
                value={returns.subtitle}
                onChange={(e) => setReturns({ ...returns, subtitle: e.target.value })}
                className="w-full border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Return Window (Days)</label>
              <input
                type="number"
                value={returns.returnWindowDays}
                onChange={(e) => setReturns({ ...returns, returnWindowDays: Number(e.target.value) })}
                className="w-full border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Pickup SLA</label>
              <input
                type="text"
                value={returns.pickupTimeline}
                onChange={(e) => setReturns({ ...returns, pickupTimeline: e.target.value })}
                className="w-full border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Refund Processing Timeline</label>
              <input
                type="text"
                value={returns.refundTimeline}
                onChange={(e) => setReturns({ ...returns, refundTimeline: e.target.value })}
                className="w-full border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          {/* Conditions Checklist */}
          <div className="flex flex-col gap-3 border-t border-slate-100 pt-5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Eligibility Conditions Checklist ({returns.conditions.length})
              </h4>
              <button
                type="button"
                onClick={() => {
                  setReturns({ ...returns, conditions: [...returns.conditions, 'New condition statement.'] });
                }}
                className="px-2.5 py-1 text-xs font-bold uppercase bg-slate-100 hover:bg-slate-200 text-slate-800 inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Condition
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {returns.conditions.map((cond, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={cond}
                    onChange={(e) => {
                      const updated = [...returns.conditions];
                      updated[idx] = e.target.value;
                      setReturns({ ...returns, conditions: updated });
                    }}
                    className="border border-slate-200 p-2 text-xs flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setReturns({
                        ...returns,
                        conditions: returns.conditions.filter((_, i) => i !== idx),
                      });
                    }}
                    className="text-rose-500 hover:text-rose-700 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Policy Sections */}
          <div className="flex flex-col gap-4 border-t border-slate-100 pt-5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Editorial Clauses ({returns.sections.length})
              </h4>
              <button
                type="button"
                onClick={() => {
                  const newSec = {
                    id: `sec-${Date.now()}`,
                    heading: 'New Return Guideline',
                    content: 'Policy clause explanation.',
                  };
                  setReturns({ ...returns, sections: [...returns.sections, newSec] });
                }}
                className="px-2.5 py-1 text-xs font-bold uppercase bg-slate-100 hover:bg-slate-200 text-slate-800 inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Clause
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {returns.sections.map((sec, idx) => (
                <div key={sec.id} className="border border-slate-200 p-4 bg-slate-50 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400">Clause 0{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setReturns({
                          ...returns,
                          sections: returns.sections.filter((s) => s.id !== sec.id),
                        });
                      }}
                      className="text-rose-500 hover:text-rose-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={sec.heading}
                    onChange={(e) => {
                      const updated = [...returns.sections];
                      updated[idx].heading = e.target.value;
                      setReturns({ ...returns, sections: updated });
                    }}
                    placeholder="Section Heading"
                    className="border border-slate-200 bg-white p-2 text-xs font-bold"
                  />
                  <textarea
                    rows={3}
                    value={sec.content}
                    onChange={(e) => {
                      const updated = [...returns.sections];
                      updated[idx].content = e.target.value;
                      setReturns({ ...returns, sections: updated });
                    }}
                    placeholder="Section Content"
                    className="border border-slate-200 bg-white p-2 text-xs resize-none"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Privacy Policy */}
      {activeTab === 'privacy' && (
        <div className="flex flex-col gap-6 bg-white border border-slate-200 p-6 sm:p-8">
          <div className="flex flex-col gap-1 border-b border-slate-100 pb-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 font-heading">
              Privacy Policy Configuration
            </h3>
            <p className="text-xs text-slate-500">
              Customize revision date, grievance email, and privacy clauses on /privacy.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Headline</label>
              <input
                type="text"
                value={privacy.title}
                onChange={(e) => setPrivacy({ ...privacy, title: e.target.value })}
                className="w-full border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Subtitle</label>
              <input
                type="text"
                value={privacy.subtitle}
                onChange={(e) => setPrivacy({ ...privacy, subtitle: e.target.value })}
                className="w-full border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Last Revised Date Label</label>
              <input
                type="text"
                value={privacy.lastUpdated}
                onChange={(e) => setPrivacy({ ...privacy, lastUpdated: e.target.value })}
                className="w-full border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">DPO / Privacy Contact Email</label>
              <input
                type="text"
                value={privacy.contactEmail}
                onChange={(e) => setPrivacy({ ...privacy, contactEmail: e.target.value })}
                className="w-full border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          {/* Policy Sections */}
          <div className="flex flex-col gap-4 border-t border-slate-100 pt-5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Privacy Clauses ({privacy.sections.length})
              </h4>
              <button
                type="button"
                onClick={() => {
                  const newSec = {
                    id: `sec-${Date.now()}`,
                    heading: 'New Data Privacy Clause',
                    content: 'Legal policy clause explanation.',
                  };
                  setPrivacy({ ...privacy, sections: [...privacy.sections, newSec] });
                }}
                className="px-2.5 py-1 text-xs font-bold uppercase bg-slate-100 hover:bg-slate-200 text-slate-800 inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Clause
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {privacy.sections.map((sec, idx) => (
                <div key={sec.id} className="border border-slate-200 p-4 bg-slate-50 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400">Clause 0{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setPrivacy({
                          ...privacy,
                          sections: privacy.sections.filter((s) => s.id !== sec.id),
                        });
                      }}
                      className="text-rose-500 hover:text-rose-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={sec.heading}
                    onChange={(e) => {
                      const updated = [...privacy.sections];
                      updated[idx].heading = e.target.value;
                      setPrivacy({ ...privacy, sections: updated });
                    }}
                    placeholder="Section Heading"
                    className="border border-slate-200 bg-white p-2 text-xs font-bold"
                  />
                  <textarea
                    rows={3}
                    value={sec.content}
                    onChange={(e) => {
                      const updated = [...privacy.sections];
                      updated[idx].content = e.target.value;
                      setPrivacy({ ...privacy, sections: updated });
                    }}
                    placeholder="Section Content"
                    className="border border-slate-200 bg-white p-2 text-xs resize-none"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

