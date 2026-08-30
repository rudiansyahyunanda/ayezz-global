import React, { useState, useEffect } from 'react';
import { X, ShoppingBag } from 'lucide-react';
import { getDesignTemplates, PLACEHOLDER_IMAGE } from '../../lib/supabaseService';

export default function SubCatalogModal({ catalog, onClose, onSelectProduct }) {
  const [activeSubCategory, setActiveSubCategory] = useState('Semua');
  const [templates, setTemplates] = useState([]);

  // Lock body scroll when modal opens
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    async function loadTemplatesForCategory() {
      const allTemplates = await getDesignTemplates();
      if (catalog && catalog.id !== 'semua_kategori') {
        const filtered = allTemplates.filter(t => t.category?.toLowerCase().includes(catalog.title?.toLowerCase()) || catalog.title?.toLowerCase().includes(t.category?.toLowerCase()));
        setTemplates(filtered.length > 0 ? filtered : allTemplates);
      } else {
        setTemplates(allTemplates);
      }
    }
    loadTemplatesForCategory();
  }, [catalog]);

  if (!catalog) return null;

  const displayItems = templates.length > 0 ? templates : (catalog.items || []);

  const filteredItems = activeSubCategory === 'Semua'
    ? displayItems
    : displayItems.filter(item => item.subCategory === activeSubCategory || item.category === activeSubCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto font-sans">
      <div className="bg-white w-full max-w-4xl rounded-t-3xl sm:rounded-3xl border-0 sm:border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-400 tracking-widest uppercase">KATALOG UTAMA</span>
            <h3 className="text-lg font-black text-slate-900 tracking-tight mt-0.5">{catalog.title}</h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors inline-flex items-center justify-center shrink-0"
          >
            <X className="w-5 h-5 shrink-0" />
          </button>
        </div>

        {/* Sub-Category Pills Navigation Menu */}
        {catalog.subCategories && catalog.subCategories.length > 0 && (
          <div className="px-5 py-3 border-b border-slate-100 flex items-center space-x-2 overflow-x-auto text-xs font-bold text-slate-600 scrollbar-none bg-white shrink-0">
            {catalog.subCategories.map((subCat) => (
              <button
                key={subCat}
                onClick={() => setActiveSubCategory(subCat)}
                className={`px-4 py-2 rounded-full transition-all whitespace-nowrap shrink-0 inline-flex items-center justify-center ${
                  activeSubCategory === subCat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                }`}
              >
                <span className="whitespace-nowrap">{subCat}</span>
              </button>
            ))}
          </div>
        )}

        {/* Product Items Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 bg-white flex-1">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-3 border border-slate-200/80 flex flex-col justify-between space-y-3 cursor-pointer group hover:border-slate-400 transition-all shadow-2xs"
              onClick={() => {
                onClose();
                onSelectProduct(item, filteredItems);
              }}
            >
              {/* Image Frame */}
              <div className="w-full aspect-square bg-slate-100 overflow-hidden rounded-xl relative">
                <img
                  src={item.thumbnail}
                  alt={item.name}
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-xl img-crisp"
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = PLACEHOLDER_IMAGE;
                  }}
                />
              </div>

              {/* Text Metadata */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-slate-600 transition-colors truncate">
                    {item.name}
                  </h4>
                  <span className="text-xs font-mono font-bold text-slate-900 shrink-0 ml-2">RM 70.00+</span>
                </div>
                <p className="text-xs text-slate-500 font-normal">{item.category || catalog.title}</p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                    onSelectProduct(item, filteredItems);
                  }}
                  className="w-full mt-2 py-3 bg-slate-900 group-hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold transition-colors inline-flex items-center justify-center space-x-2 shadow-xs whitespace-nowrap shrink-0"
                >
                  <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                  <span className="whitespace-nowrap">Tempah Sekarang</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-white border-t border-[#E5E5E5] flex items-center justify-between text-xs text-[#757575] font-mono font-bold">
          <span>{filteredItems.length} TEMPLATE REKA BENTUK</span>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[#E5E5E5] text-[#1A1A1A] font-bold rounded-full hover:bg-slate-100 transition-all font-sans inline-flex items-center justify-center whitespace-nowrap shrink-0"
          >
            <span className="whitespace-nowrap">Tutup</span>
          </button>
        </div>
      </div>
    </div>
  );
}
