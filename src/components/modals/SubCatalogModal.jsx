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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A1A]/50 backdrop-blur-sm animate-fade-in overflow-y-auto font-sans">
      <div className="bg-white w-full max-w-4xl rounded-2xl border border-[#E5E5E5] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E5E5E5] flex items-center justify-between bg-[#F6F5F3]">
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-500 tracking-widest uppercase">KATALOG UTAMA</span>
            <h3 className="text-xl font-extrabold text-[#1A1A1A] tracking-tight mt-0.5">{catalog.title}</h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#757575] hover:text-[#1A1A1A] hover:bg-slate-200/60 rounded-full transition-colors inline-flex items-center justify-center shrink-0"
          >
            <X className="w-5 h-5 shrink-0" />
          </button>
        </div>

        {/* Sub-Category Pills Navigation Menu */}
        {catalog.subCategories && catalog.subCategories.length > 0 && (
          <div className="px-6 py-3.5 border-b border-[#E5E5E5] flex items-center space-x-2 overflow-x-auto text-xs font-bold text-[#555555] scrollbar-none bg-white">
            {catalog.subCategories.map((subCat) => (
              <button
                key={subCat}
                onClick={() => setActiveSubCategory(subCat)}
                className={`px-4 py-2 rounded-full transition-all whitespace-nowrap shrink-0 inline-flex items-center justify-center ${
                  activeSubCategory === subCat
                    ? 'bg-[#1A1A1A] text-white shadow-sm'
                    : 'bg-[#F6F5F3] hover:bg-slate-200 text-[#1A1A1A]'
                }`}
              >
                <span className="whitespace-nowrap">{subCat}</span>
              </button>
            ))}
          </div>
        )}

        {/* Product Items Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 bg-[#F6F5F3]">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="brand-card rounded-2xl p-3 flex flex-col justify-between space-y-3 cursor-pointer group"
              onClick={() => {
                onClose();
                onSelectProduct(item, filteredItems);
              }}
            >
              {/* Image Frame */}
              <div className="w-full aspect-square bg-[#E5E5E5] overflow-hidden rounded-xl relative">
                <img
                  src={item.thumbnail}
                  alt={item.name}
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-lg img-crisp"
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = PLACEHOLDER_IMAGE;
                  }}
                />
              </div>

              {/* Text Metadata */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#1A1A1A] group-hover:text-[#757575] transition-colors">
                    {item.name}
                  </h4>
                  <span className="text-xs font-mono font-bold text-slate-900">RM 70.00+</span>
                </div>
                <p className="text-xs text-[#757575] font-mono">{item.category || catalog.title}</p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                    onSelectProduct(item, filteredItems);
                  }}
                  className="w-full mt-2 py-2 bg-[#1A1A1A] group-hover:bg-[#333333] text-white rounded-full text-xs font-bold transition-colors inline-flex items-center justify-center space-x-2 shadow-sm whitespace-nowrap shrink-0"
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
