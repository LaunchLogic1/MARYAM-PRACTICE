import React, { useState, useEffect } from 'react';
import { MessageCircle, RefreshCw, Download, Search, Filter, Calendar } from 'lucide-react';
import { api } from '../../services/api';
import { WhatsAppInquiryClick } from '../../types';

export function AdminInquiriesView() {
  const [inquiries, setInquiries] = useState<WhatsAppInquiryClick[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getInquiries();
      setInquiries(data);
    } catch (err) {
      console.error('Failed to load inquiries', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = inquiries.filter((inq) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      inq.productName.toLowerCase().includes(term) ||
      inq.productSku.toLowerCase().includes(term) ||
      (inq.selectedSize && inq.selectedSize.toLowerCase().includes(term))
    );
  });

  const exportCSV = () => {
    if (inquiries.length === 0) return;
    const headers = ['Timestamp', 'Product Name', 'SKU', 'Price', 'Size', 'Color'];
    const rows = inquiries.map((i) => [
      i.timestamp,
      `"${i.productName.replace(/"/g, '""')}"`,
      i.productSku,
      i.price || '',
      i.selectedSize || '',
      i.selectedColor || '',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `whatsapp_inquiries_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#421C2D] font-normal">
            WhatsApp Order Inquiries
          </h2>
          <p className="text-xs sm:text-sm text-[#7A6B74]">
            Log of customer intents clicking "Order on WhatsApp" across product pages
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            disabled={inquiries.length === 0}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#E5DDD0] text-xs font-semibold text-[#421C2D] hover:bg-[#FAF8F5] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-[#BFA36D]" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-white border border-[#E5DDD0] text-[#421C2D] hover:bg-[#FAF8F5] cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-[#EBE3D5] p-6 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#A896A0] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by product name, SKU, or size..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#FAF8F5] border border-[#E5DDD0] text-xs text-[#24101A] focus:outline-hidden focus:border-[#421C2D]"
            />
          </div>
          <span className="text-xs text-[#7A6B74] font-medium">
            Total Inquiries: <strong className="text-[#421C2D]">{inquiries.length}</strong>
          </span>
        </div>

        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-y border-[#EBE3D5] text-[#421C2D] font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Date &amp; Time</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Selected Specs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EAE1]">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                    <td className="py-3.5 px-4 text-[#7A6B74] font-mono text-[11px]">
                      {new Date(item.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#421C2D]">
                      {item.productName}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#7A6B74]">
                      {item.productSku || '-'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#421C2D]">
                      {item.price ? `Rs. ${item.price.toLocaleString()}` : '-'}
                    </td>
                    <td className="py-3.5 px-4 text-[#7A6B74]">
                      <div className="flex items-center gap-2">
                        {item.selectedSize && (
                          <span className="px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#E5DDD0] text-[10px]">
                            {item.selectedSize}
                          </span>
                        )}
                        {item.selectedColor && (
                          <span className="px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#E5DDD0] text-[10px]">
                            {item.selectedColor}
                          </span>
                        )}
                        {!item.selectedSize && !item.selectedColor && '-'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-[#7A6B74] bg-[#FAF8F5] rounded-2xl">
            {search ? 'No inquiries matching your search.' : 'No WhatsApp inquiries tracked yet.'}
          </div>
        )}
      </div>
    </div>
  );
}
