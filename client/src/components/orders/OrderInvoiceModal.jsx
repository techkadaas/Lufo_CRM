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

  const orderNumberDisplay = `#ORD-${
    (order.billNumber || '').replace(/[^0-9]/g, '').padStart(6, '0') || '000001'
  }`;

  const invoiceNumberDisplay = `#LC-${
    (order.billNumber || '').replace(/[^0-9]/g, '').padStart(6, '0') || '000001'
  }`;

  // 1. Generate text receipt for WhatsApp / Copy
  const generateReceiptText = () => {
    const itemsText = (order.items || [])
      .map(
        (it, idx) =>
          `${idx + 1}. ${it.name} (${it.size || 'M'}${it.color ? `, ${it.color}` : ''}) x ${it.quantity} = ₹${(it.total || 0).toLocaleString()}`
      )
      .join('\n');

    return `*LUFO CLOTHING — OFFICIAL INVOICE*
----------------------------------------
*Invoice No:* ${invoiceNumberDisplay}
*Date:* ${formattedDate}
*Order No:* ${orderNumberDisplay}
*Payment Method:* ${order.paymentMethod || 'Online Payment'}

*BILL TO:*
*${order.customer?.name || 'Customer'}*
${order.customer?.phone ? `Phone: ${order.customer.phone}\n` : ''}${order.customer?.address ? `Address: ${order.customer.address}\n` : ''}
*ITEMS:*
${itemsText}

----------------------------------------
*Subtotal:* ₹${(order.subtotal || order.totalAmount || 0).toLocaleString()}
*Shipping:* ₹0
*TOTAL AMOUNT:* ₹${(order.totalAmount || 0).toLocaleString()}
----------------------------------------
*Thank you for choosing LUFO Clothing!*
🌐 www.lufoclothing.com
📸 @lufo_clothing_trichy
✉️ lufoclothingofficial@gmail.com`;
  };

  // 2. Download as High-Resolution PNG Image
  const handleDownloadImage = async () => {
    const node = document.getElementById('printable-invoice');
    if (!node) return;

    try {
      setIsExportingImage(true);
      showToast('Generating high-resolution invoice image...');

      const dataUrl = await toPng(node, {
        quality: 1,
        pixelRatio: 2.5,
        backgroundColor: '#F8F6F0',
        cacheBust: true,
      });

      const link = document.createElement('a');
      link.download = `LUFO-Invoice-${order.billNumber || 'receipt'}.png`;
      link.href = dataUrl;
      link.click();
      showToast(`Invoice saved as image (${order.billNumber || 'receipt'}.png)!`);
    } catch (error) {
      console.error('Error generating image:', error);
      showToast('Failed to download invoice image', 'error');
    } finally {
      setIsExportingImage(false);
    }
  };

  // 3. Native Print / Save to PDF
  const handlePrint = () => {
    window.print();
  };

  // 4. Share on WhatsApp
  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(generateReceiptText());
    let phone = (order.customer?.phone || '').replace(/\D/g, '');
    if (phone && phone.length === 10) {
      phone = `91${phone}`;
    }
    const url = phone
      ? `https://api.whatsapp.com/send?phone=${phone}&text=${text}`
      : `https://api.whatsapp.com/send?text=${text}`;

    window.open(url, '_blank');
    showToast('Opening WhatsApp to share invoice...');
  };

  // 5. Copy Text to Clipboard
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(generateReceiptText());
      setCopied(true);
      showToast('Invoice summary copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      showToast('Failed to copy to clipboard', 'error');
    }
  };

  // 6. Native Share
  const handleNativeShare = async () => {
    const node = document.getElementById('printable-invoice');
    if (node && navigator.canShare) {
      try {
        const dataUrl = await toPng(node, { quality: 1, pixelRatio: 2, backgroundColor: '#F8F6F0' });
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], `LUFO-Invoice-${order.billNumber || 'bill'}.png`, { type: 'image/png' });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `Invoice ${order.billNumber} - LUFO Clothing`,
            text: `Invoice for order ${order.billNumber} (Total: ₹${(order.totalAmount || 0).toLocaleString()})`,
          });
          showToast('Invoice shared successfully!');
          return;
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          // fallback
        } else {
          return;
        }
      }
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Invoice ${order.billNumber} - LUFO Clothing`,
          text: generateReceiptText(),
        });
        showToast('Invoice shared successfully!');
      } catch (err) {
        if (err.name !== 'AbortError') {
          handleShareWhatsApp();
        }
      }
    } else {
      handleShareWhatsApp();
    }
  };

  return (
    <Modal
      isOpen={!!order}
      onClose={onClose}
      title={`Boutique Invoice - ${order.billNumber}`}
      subtitle="Official LUFO Clothing customer bill and store invoice receipt"
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
            {/* Download Image */}
            <button
              type="button"
              onClick={handleDownloadImage}
              disabled={isExportingImage}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
              title="Download invoice directly as a PNG image"
            >
              {isExportingImage ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileImage className="w-3.5 h-3.5" />
              )}
              <span>{isExportingImage ? 'Saving...' : 'Download Image'}</span>
            </button>

            {/* WhatsApp Share */}
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              title="Share invoice directly to WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">WhatsApp</span>
            </button>

            {/* Share */}
            <button
              type="button"
              onClick={handleNativeShare}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 shadow-2xs cursor-pointer"
              title="Share via apps"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Share</span>
            </button>

            {/* Copy Text */}
            <button
              type="button"
              onClick={handleCopyText}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 shadow-2xs cursor-pointer"
              title="Copy invoice text"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden xs:inline">{copied ? 'Copied' : 'Copy'}</span>
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

          <div className="relative z-10 flex flex-col justify-between min-h-[580px] space-y-6">
            {/* Header: Brand Left & Slogan Right */}
            <div className="flex items-start justify-between gap-3">
              {/* Brand Logo & Taglines */}
              <div className="min-w-0">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-[0.22em] text-black font-serif uppercase leading-none">
                  LUFO<span className="text-[14px] sm:text-lg align-top font-sans font-normal ml-0.5">™</span>
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

            {/* INVOICE Title & Order Meta Row */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-1">
              {/* Left: INVOICE and Greeting */}
              <div>
                <h2 className="text-lg sm:text-xl font-bold tracking-[0.28em] text-slate-900 uppercase">
                  I N V O I C E
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-600 mt-1 leading-snug">
                  Thank you for choosing LUFO Clothing.
                  <br />
                  We truly appreciate your support!
                </p>
              </div>

              {/* Right: Meta Details with vertical line */}
              <div className="border-l border-slate-300 pl-3.5 sm:pl-4 py-0.5 space-y-1 text-[11px] sm:text-xs shrink-0 self-start">
                <div className="flex items-center justify-between sm:justify-start gap-4">
                  <span className="text-slate-500 min-w-[90px]">Invoice No</span>
                  <span className="font-semibold text-slate-900">{invoiceNumberDisplay}</span>
                </div>
                <div className="flex items-center justify-between sm:justify-start gap-4">
                  <span className="text-slate-500 min-w-[90px]">Invoice Date</span>
                  <span className="font-medium text-slate-800">{formattedDate}</span>
                </div>
                <div className="flex items-center justify-between sm:justify-start gap-4">
                  <span className="text-slate-500 min-w-[90px]">Order No</span>
                  <span className="font-semibold text-slate-900">{orderNumberDisplay}</span>
                </div>
                <div className="flex items-center justify-between sm:justify-start gap-4">
                  <span className="text-slate-500 min-w-[90px]">Payment Method</span>
                  <span className="font-medium text-slate-800">{order.paymentMethod || 'Online Payment'}</span>
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
                  className="text-4xl sm:text-5xl text-slate-900 font-bold -rotate-3 select-none tracking-normal whitespace-nowrap mb-2 leading-tight"
                  style={{ fontFamily: "'Reenie Beanie', 'Caveat', 'Alex Brush', 'Dancing Script', cursive" }}
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
                  className="text-3xl sm:text-4xl font-bold text-slate-800 -rotate-6 select-none leading-none pr-1"
                  style={{ fontFamily: "'Reenie Beanie', 'Caveat', 'Alex Brush', 'Dancing Script', cursive" }}
                >
                  Lufo<span className="text-[10px] font-sans font-normal align-top ml-0.5">™</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
