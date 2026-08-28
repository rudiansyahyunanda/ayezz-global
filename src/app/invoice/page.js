'use client';

export const dynamic = 'force-dynamic';

import React, { Suspense, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Printer,
  Download,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Scissors,
  Building,
  Phone,
  Mail,
  Globe,
  ShieldCheck,
  Calendar,
  User,
  CreditCard,
  Layers,
  Shirt,
  RefreshCw
} from 'lucide-react';
import { supabase, isSupabaseConnected } from '../../lib/supabaseClient';

function InvoiceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || searchParams.get('id') || 'AYZ-DEMO';
  
  const [activeDocument, setActiveDocument] = useState('invoice'); // 'invoice' | 'jobsheet'
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrderDetails() {
      setLoading(true);
      let foundOrder = null;

      if (isSupabaseConnected && orderId) {
        try {
          const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .maybeSingle();

          if (data) {
            const totalQty = Number(data.total_qty || 1);
            const totalPrice = Number(data.total_price || 0);
            const unitPrice = totalQty > 0 ? (totalPrice / totalQty) : Number(data.unit_price || 0);

            let templateImg = data.custom_design_ref_url || '';
            if (data.template_name) {
              try {
                const { data: tpl } = await supabase
                  .from('design_templates')
                  .select('thumbnail, images')
                  .eq('name', data.template_name)
                  .maybeSingle();
                if (tpl) {
                  templateImg = tpl.thumbnail || (Array.isArray(tpl.images) && tpl.images.length > 0 ? tpl.images[0] : '');
                }
              } catch (e) {
                console.warn('Error fetching template thumbnail:', e);
              }
            }

            let parsedBreakdown = data.size_breakdown || {};
            if (typeof parsedBreakdown === 'string') {
              try { parsedBreakdown = JSON.parse(parsedBreakdown); } catch (e) {}
            }

            let parsedPlayers = data.player_rows || [];
            if (typeof parsedPlayers === 'string') {
              try { parsedPlayers = JSON.parse(parsedPlayers); } catch (e) {}
            }

            let parsedCutGrp = data.cut_groups || [];
            if (typeof parsedCutGrp === 'string') {
              try { parsedCutGrp = JSON.parse(parsedCutGrp); } catch (e) {}
            }

            foundOrder = {
              id: data.id,
              orderId: data.id,
              userEmail: data.user_email || '',
              client: data.client_name || 'Pelanggan System',
              customerPhone: data.customer_phone || '-',
              teamName: data.team_name || '-',
              template: data.template_name || 'Custom Design Sublimasi',
              templateImage: templateImg,
              cutType: data.cut_type || 'Standard Roundneck',
              fabricMaterial: data.fabric_material || 'Micro-Dryfit',
              cutGroups: parsedCutGrp,
              playerRows: parsedPlayers,
              customLogoUrl: data.custom_logo_url || '',
              sponsorLogoUrl: data.sponsor_logo_url || '',
              playerListFileUrl: data.player_list_file_url || '',
              customDesignRefUrl: data.custom_design_ref_url || '',
              notes: data.notes || '',
              sizeBreakdown: parsedBreakdown,
              qty: totalQty,
              unitPrice: unitPrice,
              totalPrice: totalPrice,
              paymentStatus: (data.status || '').includes('Lunas') ? 'paid' : (data.payment_status || 'pending'),
              paymentId: data.payment_id || data.chip_purchase_id || 'CHIP-COLLECT-ONLINE',
              date: new Date(data.created_at || Date.now()).toLocaleDateString('ms-MY', {
                day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
              }),
              status: data.status || 'Pesanan Diterima'
            };
          }
        } catch (err) {
          console.warn('Error fetching order from Supabase for invoice:', err);
        }
      }

      // Check LocalStorage fallback if not found in DB
      if (!foundOrder && typeof window !== 'undefined') {
        try {
          const localOrders = JSON.parse(localStorage.getItem('ayezz_user_orders') || '[]');
          const match = localOrders.find(o => o.orderId === orderId || o.id === orderId);
          if (match) {
            const totalQty = Number(match.qty || match.totalQty || 1);
            const totalPrice = Number(match.totalPrice || match.total_price || 0);
            const unitPrice = totalQty > 0 ? (totalPrice / totalQty) : Number(match.unitPrice || 0);
            foundOrder = {
              ...match,
              orderId: match.orderId || match.id || orderId,
              qty: totalQty,
              unitPrice: unitPrice,
              totalPrice: totalPrice
            };
          }
        } catch (e) {}
      }

      // Default Demo Fallback if still empty
      if (!foundOrder) {
        foundOrder = {
          orderId: orderId || 'AYZ-839201',
          client: 'Encik Ahmad Razak',
          customerPhone: '012-3456789',
          teamName: 'Harimau Malaya FC',
          userEmail: 'ahmad@example.com',
          template: 'AG260003 - PRO MATCH JACKET',
          cutType: 'Roundneck (Regular Sleeve)',
          fabricMaterial: 'MINI EYELET 150 GSM',
          qty: 20,
          unitPrice: 70,
          totalPrice: 1400,
          paymentStatus: 'paid',
          paymentId: 'CHIP-COLLECT-9921',
          date: new Date().toLocaleDateString('ms-MY', { day: '2-digit', month: 'long', year: 'numeric' }),
          status: 'Pesanan Diterima & Lunas',
          playerRows: [
            { id: '1', name: 'ZULKARNAIN', number: '10', size: 'L' },
            { id: '2', name: 'AMIRUL', number: '7', size: 'M' },
            { id: '3', name: 'HAKIM', number: '1', size: 'XL' }
          ]
        };
      }

      setOrder(foundOrder);
      setLoading(false);
    }

    fetchOrderDetails();
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mb-3" />
        <span className="text-xs font-mono font-bold tracking-widest text-slate-400">MENJANA INVOIS & JOB SHEET...</span>
      </div>
    );
  }

  const invoiceNo = `INV-2026-${order?.orderId || 'AYZ-0000'}`;
  const jobSheetNo = `JS-2026-${order?.orderId || 'AYZ-0000'}`;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans selection:bg-slate-900 selection:text-white print:bg-white print:p-0">
      
      {/* TOP FLOATING ACTION & TOGGLE BAR (HIDDEN DURING PRINTING) */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-md border-b border-slate-800 px-4 py-3 print:hidden">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push('/dashboard?tab=orders')}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all flex items-center space-x-1.5 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <div className="h-4 w-px bg-slate-800 hidden sm:block" />
            <h1 className="text-sm font-bold tracking-tight font-mono text-slate-200">
              DOKUMEN PESANAN #{order?.orderId}
            </h1>
          </div>

          {/* TOGGLE INVOICE VS JOBSHEET */}
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setActiveDocument('invoice')}
              className={`px-4 py-1.5 rounded-lg text-xs font-extrabold uppercase transition-all flex items-center space-x-2 ${
                activeDocument === 'invoice'
                  ? 'bg-emerald-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Invois Rasmi</span>
            </button>

            <button
              onClick={() => setActiveDocument('jobsheet')}
              className={`px-4 py-1.5 rounded-lg text-xs font-extrabold uppercase transition-all flex items-center space-x-2 ${
                activeDocument === 'jobsheet'
                  ? 'bg-blue-500 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>Job Sheet Kilang</span>
            </button>
          </div>

          {/* PRINT & DOWNLOAD BUTTONS */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs uppercase rounded-xl transition-all flex items-center space-x-1.5 shadow-sm active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-900" />
              <span>Cetak / Simpan PDF</span>
            </button>
          </div>

        </div>
      </header>

      {/* DOCUMENT PREVIEW CONTAINER */}
      <main className="max-w-4xl mx-auto my-6 sm:my-8 px-4 print:my-0 print:px-0 print:max-w-none">
        
        {/* ========================================================== */}
        {/* DOCUMENT VIEW 1: INVOIS RASMI (OFFICIAL TAX INVOICE) */}
        {/* ========================================================== */}
        {activeDocument === 'invoice' && (
          <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-xl space-y-8 print:shadow-none print:border-none print:rounded-none print:p-6 font-sans">
            
            {/* INVOICE HEADER */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-200 pb-8">
              <div className="space-y-3">
                <div className="flex items-center space-x-3 pb-1">
                  <img src="/logo/ayezz-logo-01.svg" alt="AYEZZ GLOBAL Logo" className="h-8 sm:h-9 w-auto object-contain" />
                </div>
                <div className="text-xs text-slate-600 space-y-0.5 font-normal leading-relaxed">
                  <p>A-3-17 Pangsapuri Harmoni 1, Persiaran Putra Megah,</p>
                  <p>Putra Heights, 47650 Subang Jaya, Selangor Darul Ehsan</p>
                  <p>Tel / WhatsApp: +60 11-8781 8310 • Email: admin@ayezz.com</p>
                  <p className="font-mono text-[11px] text-slate-500 font-bold">NO. PENDAFTARAN SSM: 202603218718 (PG0592101-P)</p>
                </div>
              </div>

              <div className="text-left sm:text-right space-y-2">
                <span className="px-3 py-1 bg-slate-900 text-white font-mono font-bold text-xs rounded-md uppercase tracking-wider inline-block">
                  STATUS: INVOIS LUNAS (PAID)
                </span>
                <h3 className="text-2xl font-black font-mono text-slate-900 uppercase">INVOIS RASMI</h3>
                <div className="text-xs font-mono text-slate-600 space-y-1">
                  <p><strong className="text-slate-900">NO. INVOIS:</strong> {invoiceNo}</p>
                  <p><strong className="text-slate-900">KOD PESANAN:</strong> #{order?.orderId}</p>
                  <p><strong className="text-slate-900">TARIKH:</strong> {order?.date}</p>
                  <p><strong className="text-slate-900">GATEWAY:</strong> CHIP Collect (MYR)</p>
                </div>
              </div>
            </div>

            {/* BILL TO & PAYMENT METHOD */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200/80">
              <div className="space-y-1 text-xs">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">DIBILLKAN KEPADA:</span>
                <h4 className="text-sm font-extrabold uppercase text-slate-900">{order?.client}</h4>
                <p className="text-slate-700">Pasukan / Kelab: <strong className="text-slate-900">{order?.teamName || '-'}</strong></p>
                <p className="text-slate-700">No. Telefon: <strong className="text-slate-900">{order?.customerPhone || '-'}</strong></p>
                <p className="text-slate-700">Email: <strong className="text-slate-900">{order?.userEmail || '-'}</strong></p>
              </div>

              <div className="space-y-1 text-xs font-mono">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">BUTIRAN TRANSAKSI CHIP:</span>
                <p className="text-slate-700">Status Pembayaran: <span className="text-emerald-700 font-bold">LUNAS / PAID</span></p>
                <p className="text-slate-700">ID Transaksi: <strong>{order?.paymentId || 'CHIP-COLLECT-TX'}</strong></p>
                <p className="text-slate-700">Kaedah: <strong>FPX Online Banking / Card</strong></p>
                <p className="text-slate-700">Mata Wang: <strong>MYR (Ringgit Malaysia)</strong></p>
              </div>
            </div>

            {/* INVOICE ITEMS TABLE */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">RINGKASAN ITEM & SPESIFIKASI</span>
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-white font-mono text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">PERIHAL ITEM / SPESIFIKASI</th>
                      <th className="py-3 px-4 text-center">KUANTITI</th>
                      <th className="py-3 px-4 text-right">HARGA SEUNIT</th>
                      <th className="py-3 px-4 text-right">JUMLAH (RM)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    <tr>
                      <td className="py-4 px-4 space-y-1">
                        <h5 className="font-extrabold uppercase text-slate-900 text-xs">{order?.template}</h5>
                        <p className="text-[11px] text-slate-600">
                          Potongan: <strong>{order?.cutType}</strong> • Kain: <strong>{order?.fabricMaterial}</strong>
                        </p>
                        {order?.notes && (
                          <p className="text-[10px] font-mono text-slate-500 pt-0.5">{order.notes}</p>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center font-mono font-bold text-slate-900">{order?.qty} pcs</td>
                      <td className="py-4 px-4 text-right font-mono font-bold text-slate-900">
                        RM {Number(order?.unitPrice ?? (order?.qty ? order?.totalPrice / order?.qty : 0)).toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-right font-mono font-black text-slate-900">
                        RM {Number(order?.totalPrice || 0).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* TOTAL COMPUTATION */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-t border-slate-200 pt-6">
              <div className="text-xs text-slate-500 space-y-1 max-w-sm">
                <p className="font-bold text-slate-900">TERMA & SYARAT:</p>
                <p>1. Invois ini adalah resit rasmi bukti pembayaran yang sah.</p>
                <p>2. Tempahan telah dihantar ke kilang dan sedang diproses.</p>
                <p>3. Sebarang pertanyaan sila hubungi kami di support@ayezz.com.</p>
              </div>

              <div className="w-full sm:w-72 space-y-2 font-mono text-xs text-slate-700">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-bold text-slate-900">RM {Number(order?.totalPrice || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cukai SST (0%):</span>
                  <span className="font-bold text-slate-900">RM 0.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Penghantaran:</span>
                  <span className="font-bold text-slate-900">PERCUMA</span>
                </div>
                <div className="flex justify-between border-t border-slate-900 pt-2 text-sm font-black text-slate-900">
                  <span>JUMLAH DIBAYAR:</span>
                  <span>RM {Number(order?.totalPrice || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* INVOICE FOOTER */}
            <div className="pt-8 border-t border-slate-100 text-center space-y-1 text-[11px] text-slate-400 font-mono">
              <p className="font-bold text-slate-700">TERIMA KASIH KERANA MEMILIH AYEZZ GLOBAL</p>
              <p>Invois dijana secara automatik oleh Sistem AYEZZ Sublimation ERP. Tidak memerlukan tandatangan fizikal.</p>
            </div>

          </div>
        )}

        {/* ========================================================== */}
        {/* DOCUMENT VIEW 2: JOB SHEET KILANG (FACTORY PRODUCTION SHEET) */}
        {/* ========================================================== */}
        {activeDocument === 'jobsheet' && (() => {
          // Dynamic Size Breakdown Matrix Calculation (4-Level Failsafe Parser)
          const sizeKeys = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];
          const sizeCounts = { XS: 0, S: 0, M: 0, L: 0, XL: 0, '2XL': 0, '3XL': 0, '4XL': 0, '5XL': 0 };
          let totalCountFromRows = 0;

          // 1. Calculate from playerRows
          let pRows = order?.playerRows;
          if (typeof pRows === 'string') {
            try { pRows = JSON.parse(pRows); } catch (e) {}
          }
          if (Array.isArray(pRows) && pRows.length > 0) {
            pRows.forEach(p => {
              const sz = (p.size || p.sz || 'L').toString().trim().toUpperCase();
              if (sizeCounts[sz] !== undefined) {
                sizeCounts[sz]++;
              } else {
                sizeCounts[sz] = 1;
              }
              totalCountFromRows++;
            });
          }

          // 2. Calculate from sizeBreakdown object if playerRows gave 0 count
          if (totalCountFromRows === 0) {
            let sb = order?.sizeBreakdown;
            if (typeof sb === 'string') {
              try { sb = JSON.parse(sb); } catch (e) {}
            }
            if (sb && typeof sb === 'object') {
              Object.keys(sb).forEach(k => {
                const val = Number(sb[k]) || 0;
                const upperK = k.toString().trim().toUpperCase();
                if (val > 0) {
                  if (sizeCounts[upperK] !== undefined) {
                    sizeCounts[upperK] = (sizeCounts[upperK] || 0) + val;
                  } else {
                    sizeCounts[upperK] = val;
                  }
                  totalCountFromRows += val;
                }
              });
            }
          }

          // 3. Calculate from cutGroups if still 0
          if (totalCountFromRows === 0) {
            let cg = order?.cutGroups;
            if (typeof cg === 'string') {
              try { cg = JSON.parse(cg); } catch (e) {}
            }
            if (Array.isArray(cg) && cg.length > 0) {
              cg.forEach(group => {
                const grpBreakdown = group.sizeBreakdown || group.sizes || {};
                Object.keys(grpBreakdown).forEach(k => {
                  const val = Number(grpBreakdown[k]) || 0;
                  const upperK = k.toString().trim().toUpperCase();
                  if (val > 0) {
                    if (sizeCounts[upperK] !== undefined) {
                      sizeCounts[upperK] = (sizeCounts[upperK] || 0) + val;
                    } else {
                      sizeCounts[upperK] = val;
                    }
                    totalCountFromRows += val;
                  }
                });
              });
            }
          }

          const finalTotalPcs = totalCountFromRows > 0 ? totalCountFromRows : (order?.qty || 1);

          // 4. Smart Fallback for test/quick checkout orders created without size breakdown:
          // If totalCountFromRows is still 0, distribute finalTotalPcs into size L
          if (totalCountFromRows === 0 && finalTotalPcs > 0) {
            sizeCounts['L'] = finalTotalPcs;
          }

          return (
            <div className="bg-white p-8 sm:p-12 rounded-2xl border-2 border-slate-900 shadow-none space-y-8 print:border-none print:p-4 font-sans">
              
              {/* JOB SHEET HEADER */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b-2 border-slate-900 pb-6">
                <div className="space-y-2">
                  <span className="px-2.5 py-0.5 bg-slate-900 text-white font-mono font-bold text-[10px] rounded-sm uppercase tracking-widest inline-block">
                    TIKET ARAHAN KILANG (FACTORY JOB SHEET)
                  </span>
                  <div className="flex items-center space-x-3 pt-1">
                    <img src="/logo/ayezz-logo-01.svg" alt="AYEZZ GLOBAL Logo" className="h-8 w-auto object-contain" />
                    <span className="text-xs font-mono font-bold text-slate-900 uppercase tracking-widest border-l-2 border-slate-900 pl-3">PRODUCTION DEPT</span>
                  </div>
                  <p className="text-xs text-slate-600 font-mono">Borang Cetakan Sublimasi, Potongan & Jahitan Jersi Kustom</p>
                </div>

                <div className="text-left sm:text-right space-y-1 font-mono text-xs text-slate-900">
                  <p><strong>NO. JOB SHEET:</strong> <span className="font-extrabold">{jobSheetNo}</span></p>
                  <p><strong>KOD PESANAN:</strong> #{order?.orderId}</p>
                  <p><strong>TARIKH KILANG:</strong> {order?.date}</p>
                  <p><strong>STATUS:</strong> <span className="border border-slate-900 px-2 py-0.5 rounded text-[10px] font-bold uppercase">UTAMA (LUNAS)</span></p>
                </div>
              </div>

              {/* CLIENT & SPECIFICATION SUMMARY */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-xl border border-slate-900">
                <div className="space-y-1 text-xs">
                  <span className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest block border-b border-slate-300 pb-1 mb-1">MAKLUMAT PELANGGAN / PASUKAN</span>
                  <h4 className="text-sm font-extrabold uppercase text-slate-900">{order?.client}</h4>
                  <p className="text-slate-700 font-mono">Pasukan: <strong className="text-slate-900">{order?.teamName || '-'}</strong></p>
                  <p className="text-slate-700 font-mono">No. Telefon: <strong className="text-slate-900">{order?.customerPhone || '-'}</strong></p>
                  <p className="text-slate-700 font-mono">Email: <strong className="text-slate-900">{order?.userEmail || '-'}</strong></p>
                </div>

                <div className="space-y-1 text-xs font-mono">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block border-b border-slate-300 pb-1 mb-1">SPESIFIKASI PRODUKSI KILANG</span>
                  <p className="text-slate-900">REKA BENTUK: <strong className="uppercase">{order?.template}</strong></p>
                  <p className="text-slate-900">POTONGAN & KOLAR: <strong className="uppercase">{order?.cutType}</strong></p>
                  <p className="text-slate-900">BAHAN KAIN: <strong className="uppercase">{order?.fabricMaterial}</strong></p>
                  <p className="text-slate-900">JUMLAH PRODUKSI: <strong className="text-sm font-black">{finalTotalPcs} PCS</strong></p>
                </div>
              </div>

              {/* VISUAL DESIGN & LOGOS PREVIEW BOX */}
              <div className="space-y-3">
                <span className="text-[11px] font-mono font-extrabold text-slate-900 uppercase tracking-wider block">
                  1. VISUAL REKA BENTUK TEMPLATE & GAMBAR LOGO (DESIGN & LOGO PREVIEW)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                  {/* TEMPLATE / REF IMAGE */}
                  <div className="p-3 bg-white border border-slate-900 rounded-xl space-y-2">
                    <span className="text-[10px] text-slate-700 font-bold uppercase block border-b border-slate-200 pb-1">TEMPLATE / REKA BENTUK:</span>
                    <div className="flex flex-col items-center justify-center p-2 bg-slate-50 rounded-lg border border-slate-200 min-h-40">
                      {order?.templateImage || order?.customDesignRefUrl ? (
                        <img
                          src={order?.templateImage || order?.customDesignRefUrl}
                          alt="Visual Template"
                          className="max-h-36 w-auto object-contain rounded"
                        />
                      ) : (
                        <div className="text-center p-2 text-slate-500">
                          <span className="text-[10px] font-bold uppercase block">[ TIADA GAMBAR TEMPLATE ]</span>
                          <span className="text-[10px] uppercase font-mono block mt-1">{order?.template}</span>
                        </div>
                      )}
                    </div>
                    {order?.customDesignRefUrl && (
                      <a href={order.customDesignRefUrl} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-slate-900 underline block text-center uppercase">Buka Fail HD Design →</a>
                    )}
                  </div>

                  {/* LOGO PASUKAN */}
                  <div className="p-3 bg-white border border-slate-900 rounded-xl space-y-2">
                    <span className="text-[10px] text-slate-700 font-bold uppercase block border-b border-slate-200 pb-1">LOGO PASUKAN (CREST):</span>
                    <div className="flex flex-col items-center justify-center p-2 bg-slate-50 rounded-lg border border-slate-200 min-h-40">
                      {order?.customLogoUrl ? (
                        <img src={order.customLogoUrl} alt="Logo Pasukan" className="max-h-32 w-auto object-contain p-1" />
                      ) : (
                        <div className="text-center text-slate-500 p-2">
                          <span className="text-[10px] font-bold uppercase block">[ TIADA LOGO PASUKAN ]</span>
                        </div>
                      )}
                    </div>
                    {order?.customLogoUrl && (
                      <a href={order.customLogoUrl} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-slate-900 underline block text-center uppercase">Muat Turun Logo HD →</a>
                    )}
                  </div>

                  {/* LOGO SPONSOR */}
                  <div className="p-3 bg-white border border-slate-900 rounded-xl space-y-2">
                    <span className="text-[10px] text-slate-700 font-bold uppercase block border-b border-slate-200 pb-1">LOGO SPONSOR (CHEST):</span>
                    <div className="flex flex-col items-center justify-center p-2 bg-slate-50 rounded-lg border border-slate-200 min-h-40">
                      {order?.sponsorLogoUrl ? (
                        <img src={order.sponsorLogoUrl} alt="Logo Sponsor" className="max-h-32 w-auto object-contain p-1" />
                      ) : (
                        <div className="text-center text-slate-500 p-2">
                          <span className="text-[10px] font-bold uppercase block">[ TIADA LOGO SPONSOR ]</span>
                        </div>
                      )}
                    </div>
                    {order?.sponsorLogoUrl && (
                      <a href={order.sponsorLogoUrl} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-slate-900 underline block text-center uppercase">Muat Turun Sponsor HD →</a>
                    )}
                  </div>
                </div>

                {order?.playerListFileUrl && (
                  <div className="p-3 bg-slate-100 border border-slate-900 rounded-xl flex items-center justify-between font-mono text-xs text-slate-900">
                    <span className="font-bold">[ FAIL DOKUMEN SENARAI PEMAIN TERUNGGAH ]</span>
                    <a href={order.playerListFileUrl} target="_blank" rel="noreferrer" className="px-3 py-1 bg-slate-900 text-white rounded font-bold text-[11px] uppercase">
                      Muat Turun Dokumen →
                    </a>
                  </div>
                )}
              </div>

              {/* JADUAL AGIHAN SAIZ KILANG (SIZE BREAKDOWN MATRIX TABLE) */}
              <div className="space-y-3">
                <span className="text-[11px] font-mono font-extrabold text-slate-900 uppercase tracking-wider block">
                  2. JADUAL AGIHAN SAIZ BAJU KILANG (SIZE BREAKDOWN MATRIX)
                </span>

                <div className="border-2 border-slate-900 rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-center border-collapse text-xs font-mono">
                    <thead>
                      <tr className="bg-slate-900 text-white font-bold text-[11px] uppercase tracking-wider">
                        {sizeKeys.map(k => (
                          <th key={k} className="py-2.5 px-2 border-r border-slate-700">{k}</th>
                        ))}
                        <th className="py-2.5 px-3 bg-slate-950">JUMLAH PCS</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white font-black text-slate-900 text-sm">
                        {sizeKeys.map(k => (
                          <td key={k} className={`py-3 px-2 border-r border-slate-300 ${sizeCounts[k] > 0 ? 'bg-slate-200 text-slate-950 font-extrabold' : 'text-slate-400 font-normal'}`}>
                            {sizeCounts[k]}
                          </td>
                        ))}
                        <td className="py-3 px-3 bg-slate-900 text-white font-black text-base">{finalTotalPcs} PCS</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* PLAYER NAMES & NUMBERS MATRIX TABLE */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-extrabold text-slate-900 uppercase tracking-wider block">
                    3. SENARAI NAMA, NOMBOR & SAIZ PEMAIN (ROSTER PRINTING TABLE)
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-600">
                    {Array.isArray(order?.playerRows) ? order.playerRows.length : 0} Orang Terrekod
                  </span>
                </div>

                {Array.isArray(order?.playerRows) && order.playerRows.length > 0 ? (
                  <div className="border-2 border-slate-900 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs font-sans">
                      <thead className="bg-slate-900 text-white font-mono text-[10px] uppercase">
                        <tr>
                          <th className="py-2.5 px-3">BIL</th>
                          <th className="py-2.5 px-4">NAMA CETAKAN (BACK NAME)</th>
                          <th className="py-2.5 px-4 text-center">NOMBOR BAJU</th>
                          <th className="py-2.5 px-4 text-center">SAIZ BAJU</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-mono font-bold text-slate-900">
                        {order.playerRows.map((p, idx) => (
                          <tr key={p.id || idx} className="hover:bg-slate-50">
                            <td className="py-2 px-3 text-slate-500 font-normal">{idx + 1}</td>
                            <td className="py-2 px-4 uppercase text-sm">{p.name || '-'}</td>
                            <td className="py-2 px-4 text-center text-sm font-black text-blue-800">{p.number || '-'}</td>
                            <td className="py-2 px-4 text-center text-xs bg-slate-100 font-extrabold">{p.size || 'L'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-600">
                    Tiada senarai jadual manual. Senarai nama dihantar dalam bentuk fail dokumen terunggah atau cetakan standard tanpa nama.
                  </div>
                )}
              </div>

              {/* FACTORY QC SIGN OFF CHECKBOXES */}
              <div className="pt-6 border-t-2 border-slate-900 space-y-4">
                <span className="text-[11px] font-mono font-extrabold text-slate-900 uppercase tracking-wider block">
                  4. SEMAKAN KUALITI & PENGESAHAN OPERASI KILANG (QC CHECKLIST)
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                  <div className="p-3 border border-slate-300 rounded-xl space-y-1">
                    <span className="font-bold text-slate-900 block">[ ] SUBLIMATION PRINT</span>
                    <span className="text-[10px] text-slate-500 block">Operator: __________</span>
                  </div>
                  <div className="p-3 border border-slate-300 rounded-xl space-y-1">
                    <span className="font-bold text-slate-900 block">[ ] HEAT PRESSING</span>
                    <span className="text-[10px] text-slate-500 block">Operator: __________</span>
                  </div>
                  <div className="p-3 border border-slate-300 rounded-xl space-y-1">
                    <span className="font-bold text-slate-900 block">[ ] SEWING & TAILOR</span>
                    <span className="text-[10px] text-slate-500 block">Operator: __________</span>
                  </div>
                  <div className="p-3 border border-slate-300 rounded-xl space-y-1">
                    <span className="font-bold text-slate-900 block">[ ] QC & PACKAGING</span>
                    <span className="text-[10px] text-slate-500 block">Inspector: _________</span>
                  </div>
                </div>
              </div>

            </div>
          );
        })()}

      </main>

    </div>
  );
}

export default function InvoicePage() {
  return (
    <Suspense fallback={
      <div className="h-screen bg-slate-900 flex flex-col items-center justify-center space-y-4 text-white">
        <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
          MENJANA INVOIS & JOB SHEET...
        </p>
      </div>
    }>
      <InvoiceContent />
    </Suspense>
  );
}
