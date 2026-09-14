import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import {
  Printer,
  Download,
  Share2,
  Copy,
  Check,
  MessageSquare,
  FileImage,
  Loader2,
  Globe,
  Instagram,
  Mail,
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { OrderStatusBadge } from './OrderStatusBadge';

export const formatOrderNumber = (val) => {
  if (!val) return '01';
  const clean = String(val).replace(/[^0-9]/g, '');
  if (!clean) return String(val);
  const num = parseInt(clean, 10);
  return String(num).padStart(2, '0');
};

export const OrderInvoiceModal = ({ order, onClose }) => {
  const { showToast } = useApp();
  const [copied, setCopied] = useState(false);
  const [isExportingImage, setIsExportingImage] = useState(false);

  if (!order) return null;

  const formattedDate = new Date(order.orderDate || order.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const orderNumFormatted = formatOrderNumber(order.billNumber);
  const orderNumberDisplay = `#${orderNumFormatted}`;

  // 1. Download as High-Resolution PNG Image
  const handleDownloadImage = async () => {
    const node = document.getElementById('printable-invoice');
    if (!node) return;

    try {
      setIsExportingImage(true);
      showToast('Generating invoice image...');

      const dataUrl = await toPng(node, {
        quality: 1,
        pixelRatio: 2.5,
        backgroundColor: '#F8F6F0',
        cacheBust: true,
      });

      const link = document.createElement('a');
      link.download = `LUFO-Order-${orderNumFormatted}.png`;
      link.href = dataUrl;
      link.click();
      showToast(`Invoice image saved (LUFO-Order-${orderNumFormatted}.png)!`);
    } catch (error) {
      console.error('Error generating image:', error);
      showToast('Failed to download invoice image', 'error');
    } finally {
      setIsExportingImage(false);
    }
  };

  // 2. Native Print / Save to PDF
  const handlePrint = () => {
    window.print();
  };

  // 3. Share as Image to WhatsApp directly to customer
  const handleShareWhatsApp = async () => {
    const node = document.getElementById('printable-invoice');
    if (!node) return;

    try {
      setIsExportingImage(true);
      showToast('Generating invoice image for WhatsApp...');

      const dataUrl = await toPng(node, {
        quality: 1,
        pixelRatio: 2.5,
        backgroundColor: '#F8F6F0',
        cacheBust: true,
      });

      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `LUFO-Order-${orderNumFormatted}.png`, { type: 'image/png' });

      // If mobile or desktop browser supports file sharing via Web Share API
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `LUFO Clothing - Order #${orderNumFormatted}`,
          text: `Order bill #${orderNumFormatted} for ${order.customer?.name || 'Customer'} (Total: ₹${(order.totalAmount || 0).toLocaleString()})`,
        });
        showToast('Invoice image shared successfully!');
        return;
      }

      // For desktop WhatsApp Web fallback: Copy image to clipboard & trigger download + open chat
      let copiedImage = false;
      try {
        if (navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          copiedImage = true;
        }
      } catch (clipboardErr) {
        console.warn('Clipboard write error:', clipboardErr);
      }

      // Trigger image download
      const link = document.createElement('a');
      link.download = `LUFO-Order-${orderNumFormatted}.png`;
      link.href = dataUrl;
      link.click();

      // Open WhatsApp chat directly with customer phone
      const rawPhone = (order.customer?.phone || '').replace(/\D/g, '');
      let cleanPhone = rawPhone.replace(/^0+/, '');
      if (cleanPhone.length === 10) cleanPhone = `91${cleanPhone}`;

      const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : `https://wa.me/`;
      window.open(waUrl, '_blank');

      if (copiedImage) {
        showToast(`Invoice image copied & downloaded! Paste (Ctrl+V) in WhatsApp chat with ${order.customer?.name || 'Customer'}.`, 'success');
      } else {
        showToast(`Invoice image downloaded! Attach it in WhatsApp chat with ${order.customer?.name || 'Customer'}.`, 'success');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error sharing image on WhatsApp:', error);
        showToast('Failed to prepare invoice image', 'error');
      }
    } finally {
      setIsExportingImage(false);
    }
  };

  // 4. Copy Image to Clipboard
  const handleCopyImage = async () => {
    const node = document.getElementById('printable-invoice');
    if (!node) return;

    try {
      setIsExportingImage(true);
      const dataUrl = await toPng(node, {
        quality: 1,
        pixelRatio: 2.5,
        backgroundColor: '#F8F6F0',
        cacheBust: true,
      });

      const res = await fetch(dataUrl);
      const blob = await res.blob();

      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        setCopied(true);
        showToast('Invoice image copied to clipboard! Paste (Ctrl+V) in WhatsApp or chat.');
        setTimeout(() => setCopied(false), 3000);
      } else {
        const link = document.createElement('a');
        link.download = `LUFO-Order-${orderNumFormatted}.png`;
        link.href = dataUrl;
        link.click();
        showToast('Invoice image downloaded!');
      }
    } catch (err) {
      console.error('Failed to copy image:', err);
      handleDownloadImage();
    } finally {
      setIsExportingImage(false);
    }
  };

  // 5. Native Share with Image File
  const handleNativeShare = async () => {
    const node = document.getElementById('printable-invoice');
    if (!node) return;

    try {
      setIsExportingImage(true);
      const dataUrl = await toPng(node, { quality: 1, pixelRatio: 2.5, backgroundColor: '#F8F6F0' });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `LUFO-Order-${orderNumFormatted}.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `LUFO Clothing - Order #${orderNumFormatted}`,
          text: `Order bill #${orderNumFormatted} (Total: ₹${(order.totalAmount || 0).toLocaleString()})`,
        });
        showToast('Invoice image shared successfully!');
        return;
      }

      handleShareWhatsApp();
    } catch (err) {
      if (err.name !== 'AbortError') {
        handleShareWhatsApp();
      }
    } finally {
      setIsExportingImage(false);
    }
  };

  return (
    <Modal
      isOpen={!!order}
      onClose={onClose}
      title={`Order Bill - #${orderNumFormatted}`}
      subtitle="Official LUFO Clothing customer bill and order receipt"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Actions & Sharing Toolbar (hidden on print) */}
        <div className="no-print flex flex-wrap items-center justify-between gap-2 p-2.5 sm:p-3 rounded-2xl bg-slate-900 text-white shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Status:</span>
            <OrderStatusBadge status={order.status} />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {/* Share as Image on WhatsApp */}
            <button
              type="button"
              onClick={handleShareWhatsApp}
              disabled={isExportingImage}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
              title="Share invoice as image directly on WhatsApp"
            >
              {isExportingImage ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <MessageSquare className="w-3.5 h-3.5" />
              )}
              <span>{isExportingImage ? 'Preparing...' : 'Share Image on WhatsApp'}</span>
            </button>

            {/* Download Image */}
            <button
              type="button"
              onClick={handleDownloadImage}
              disabled={isExportingImage}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
              title="Download bill as a high-res PNG image"
            >
              <FileImage className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Save Image</span>
            </button>

            {/* Copy Image */}
            <button
              type="button"
              onClick={handleCopyImage}
              disabled={isExportingImage}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 shadow-2xs cursor-pointer"
              title="Copy bill image to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden xs:inline">{copied ? 'Copied' : 'Copy Image'}</span>
            </button>

            {/* Share via Apps */}
            <button
              type="button"
              onClick={handleNativeShare}
              disabled={isExportingImage}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 shadow-2xs cursor-pointer"
              title="Share image via installed apps"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Share</span>
            </button>

            {/* Print / Save as PDF */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 shadow-2xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Print</span>
            </button>
          </div>
        </div>

        {/* The Exact Printable / Exportable Invoice Container */}
        <div
          id="printable-invoice"
          className="relative w-full max-w-full rounded-2xl bg-[#F8F6F0] text-slate-900 shadow-xl border border-[#E7E2D6] font-sans p-5 sm:p-9 overflow-hidden selection:bg-amber-200"
          style={{ backgroundColor: '#F8F6F0' }}
        >
          {/* Subtle Organic Wave Background Art */}
          <div className="absolute inset-0 pointer-events-none opacity-40 z-0">
            <svg
              className="absolute bottom-0 right-0 w-full h-48 sm:h-64 object-cover"
              viewBox="0 0 600 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              <path
                d="M150 200 C300 120 420 180 600 80 L600 200 L150 200 Z"
                fill="#EDE7DB"
                opacity="0.7"
              />
              <path
                d="M280 200 C400 140 490 170 600 110 L600 200 L280 200 Z"
                fill="#E2DBD0"
                opacity="0.8"
              />
              <path
                d="M0 185 C80 170 120 190 180 200 L0 200 Z"
                fill="#374843"
                opacity="0.85"
              />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col justify-between min-h-[560px] space-y-6">
            {/* Header: Brand Left & Slogan Right */}
            <div className="flex items-start justify-between gap-3">
              {/* Brand Logo & Taglines */}
              <div className="min-w-0">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-[0.22em] text-black font-serif uppercase leading-none">
                  LUFO
                </h1>
                <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.42em] text-slate-900 uppercase mt-1.5 pl-0.5 whitespace-nowrap">
                  C L O T H I N G
                </p>
                <p className="text-[8px] sm:text-[9px] font-semibold tracking-[0.25em] text-slate-500 uppercase mt-1 pl-0.5 whitespace-nowrap">
                  WEAR YOUR STORY
                </p>
              </div>

              {/* Slogan with Left Vertical Bar */}
              <div className="border-l-2 border-slate-900 pl-2.5 sm:pl-3 py-0.5 text-right self-start shrink-0">
                <p className="text-[8px] sm:text-[9.5px] font-bold tracking-[0.16em] text-slate-900 leading-[1.3] uppercase whitespace-nowrap">
                  BETTER<br />STYLES.<br />BRIGHTER<br />DAYS.
                </p>
              </div>
            </div>

            {/* Bill Title & Order Meta Row */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-1">
              {/* Left: Greeting */}
              <div>
                <h2 className="text-lg sm:text-xl font-bold tracking-[0.28em] text-slate-900 uppercase">
                  B I L L
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-600 mt-1 leading-snug">
                  Thank you for choosing LUFO Clothing.
                  <br />
                  We truly appreciate your support!
                </p>
              </div>

              {/* Right: Meta Details with vertical line (NO INVOICE NUMBER) */}
              <div className="border-l border-slate-300 pl-3.5 sm:pl-4 py-0.5 space-y-1.5 text-[11px] sm:text-xs shrink-0 self-start">
                <div className="flex items-center justify-between sm:justify-start gap-4">
                  <span className="text-slate-500 min-w-[90px]">Order No</span>
                  <span className="font-bold font-mono text-slate-950">{orderNumberDisplay}</span>
                </div>
                <div className="flex items-center justify-between sm:justify-start gap-4">
                  <span className="text-slate-500 min-w-[90px]">Order Date</span>
                  <span className="font-medium text-slate-800">{formattedDate}</span>
                </div>
                <div className="flex items-center justify-between sm:justify-start gap-4">
                  <span className="text-slate-500 min-w-[90px]">Payment Method</span>
                  <span className="font-medium text-slate-800">{order.paymentMethod || 'Online Payment'}</span>
                </div>
                <div className="flex items-center justify-between sm:justify-start gap-4">
                  <span className="text-slate-500 min-w-[90px]">Payment Status</span>
                  <span className="font-semibold text-emerald-700">{order.paymentStatus || 'Paid'}</span>
                </div>
              </div>
            </div>

            {/* BILL TO Box */}
            <div className="bg-[#EFECE5] rounded-2xl p-4 sm:p-5 max-w-sm w-full text-[11px] sm:text-xs space-y-1 border border-[#E4DFD5]/60 shadow-2xs">
              <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.18em] text-slate-700 uppercase block mb-1">
                BILL TO
              </span>
              <p className="font-bold text-slate-900 text-xs sm:text-sm">
                {order.customer?.name || 'Customer Name'}
              </p>
              {order.customer?.email ? (
                <p className="text-slate-600 truncate">{order.customer.email}</p>
              ) : order.customer?.phone ? (
                <p className="text-slate-600">{order.customer.phone}</p>
              ) : null}
              <p className="text-slate-600 whitespace-pre-line leading-relaxed">
                {order.customer?.address || 'Customer Address'}
              </p>
              <p className="text-slate-600 font-medium">India</p>
            </div>

            {/* Items Table Header & Rows */}
            <div className="space-y-2.5 pt-1">
              {/* Header Pill */}
              <div className="bg-[#E7E2D8] rounded-xl px-3 sm:px-4 py-2 text-[9px] sm:text-[10.5px] font-bold uppercase tracking-wider text-slate-700 grid grid-cols-12 gap-1 items-center">
                <div className="col-span-1 text-center">NO.</div>
                <div className="col-span-6 sm:col-span-6 pl-1">ITEM</div>
                <div className="col-span-1 text-center">QTY</div>
                <div className="col-span-2 text-right">PRICE</div>
                <div className="col-span-2 text-right">TOTAL</div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-slate-200/70">
                {(order.items || []).map((item, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-12 gap-1 py-3 px-3 sm:px-4 items-center text-xs text-slate-800"
                  >
                    {/* NO */}
                    <div className="col-span-1 text-center font-medium text-slate-500 text-[11px]">
                      {idx + 1}
                    </div>

                    {/* ITEM */}
                    <div className="col-span-6 sm:col-span-6 pl-1 pr-1">
                      <div className="font-bold text-slate-900 text-xs sm:text-sm leading-tight">
                        {item.name}
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-slate-500 font-normal mt-0.5">
                        Size: {item.size || 'M'} {item.color ? ` | Color: ${item.color}` : ''}
                      </div>
                    </div>

                    {/* QTY */}
                    <div className="col-span-1 text-center font-medium text-slate-800 text-xs">
                      {item.quantity}
                    </div>

                    {/* PRICE */}
                    <div className="col-span-2 text-right font-medium text-slate-700 text-[11px] sm:text-xs">
                      ₹ {(item.price || 0).toLocaleString()}
                    </div>

                    {/* TOTAL */}
                    <div className="col-span-2 text-right font-bold text-slate-900 text-xs sm:text-sm">
                      ₹ {(item.total || 0).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Section: Thank You on Left, Subtotal/Total on Right */}
            <div className="flex flex-col-reverse sm:flex-row items-start sm:items-end justify-between gap-6 pt-3">
              {/* Left: Cursive Thank You Note with no wrapping / overlap */}
              <div className="pt-1 pb-1">
                <div
                  className="text-4xl sm:text-5xl text-slate-900 font-semibold -rotate-2 select-none tracking-normal whitespace-nowrap mb-2 leading-tight"
                  style={{ fontFamily: "'Great Vibes', 'Alex Brush', 'Dancing Script', 'Caveat', cursive" }}
                >
                  Thank You!
                </div>
                <p className="text-[11px] sm:text-xs text-slate-700 font-medium whitespace-nowrap">
                  For being a part of LUFO.
                </p>
                <p className="text-[11px] sm:text-xs text-slate-700 font-medium whitespace-nowrap">
                  Your support means a lot to us!
                </p>
              </div>

              {/* Right: Subtotal & Total Highlight Pill */}
              <div className="w-full sm:w-60 space-y-1.5 text-xs text-slate-700 ml-auto">
                <div className="flex justify-between items-center px-1">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">
                    ₹ {(order.subtotal || order.totalAmount || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center px-1">
                  <span>Shipping</span>
                  <span className="font-semibold text-slate-900">₹ 0</span>
                </div>

                {/* Total Pill */}
                <div className="bg-[#E7E2D8] rounded-xl px-4 py-2.5 flex justify-between items-center text-sm font-bold text-slate-900 mt-2 shadow-2xs">
                  <span>Total</span>
                  <span className="text-base font-extrabold text-black">
                    ₹ {(order.totalAmount || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Bar: Socials & Contact */}
            <div className="pt-4 border-t border-slate-300/80">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-[11px] text-slate-700 font-medium">
                {/* Website */}
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <Globe className="w-3.5 h-3.5 text-slate-600" />
                  <span>www.lufoclothing.com</span>
                </div>

                <span className="hidden sm:inline text-slate-300">|</span>

                {/* Instagram (Requested: lufo_clothing_trichy) */}
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <Instagram className="w-3.5 h-3.5 text-slate-600" />
                  <span>@lufo_clothing_trichy</span>
                </div>

                <span className="hidden sm:inline text-slate-300">|</span>

                {/* Email (Requested: lufoclothingofficial@gmail.com) */}
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <Mail className="w-3.5 h-3.5 text-slate-600" />
                  <span>lufoclothingofficial@gmail.com</span>
                </div>
              </div>

              {/* Bottom Branding & Signature */}
              <div className="flex items-end justify-between pt-4 mt-2">
                <div>
                  <div className="text-[11px] sm:text-xs font-extrabold tracking-[0.22em] text-slate-900 uppercase font-serif whitespace-nowrap">
                    LUFO CLOTHING
                  </div>
                  <div className="text-[8px] sm:text-[9px] font-bold tracking-[0.28em] text-slate-500 uppercase mt-0.5 whitespace-nowrap">
                    STYLE &nbsp;/&nbsp; COMFORT &nbsp;/&nbsp; YOU
                  </div>
                </div>

                {/* LUFO Signature on bottom right */}
                <div
                  className="text-3xl sm:text-4xl font-semibold text-slate-800 -rotate-6 select-none leading-none pr-1"
                  style={{ fontFamily: "'Great Vibes', 'Alex Brush', 'Dancing Script', 'Caveat', cursive" }}
                >
                  Lufo
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
