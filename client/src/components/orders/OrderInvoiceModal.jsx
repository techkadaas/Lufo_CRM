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
  Mail,
  FileImage,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { OrderStatusBadge } from './OrderStatusBadge';

export const OrderInvoiceModal = ({ order, onClose }) => {
  const { showToast } = useApp();
  const [copied, setCopied] = useState(false);
  const [isExportingImage, setIsExportingImage] = useState(false);

  if (!order) return null;

  const formattedDate = new Date(order.orderDate || order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // 1. Generate text receipt for WhatsApp / Copy / Email
  const generateReceiptText = () => {
    const itemsText = (order.items || [])
      .map(
        (it, idx) =>
          `${idx + 1}. ${it.name} (${it.size || 'M'}${it.color ? `, ${it.color}` : ''}) x ${it.quantity} = ₹${(it.total || 0).toLocaleString()}`
      )
      .join('\n');

    return `🛍️ *LUFO CLOTHING — BOUTIQUE INVOICE*
----------------------------------------
*Bill Number:* ${order.billNumber}
*Date:* ${formattedDate}
*Customer:* ${order.customer?.name || 'Valued Client'}
*Phone:* ${order.customer?.phone || 'N/A'}
${order.customer?.address ? `*Address:* ${order.customer.address}\n` : ''}*Status:* ${order.status}
*Payment:* ${order.paymentMethod} (${order.paymentStatus})

*ITEMS:*
${itemsText}

----------------------------------------
*Subtotal:* ₹${(order.subtotal || 0).toLocaleString()}
${order.discount > 0 ? `*Discount Applied:* -₹${(order.discount || 0).toLocaleString()}\n` : ''}*FINAL TOTAL AMOUNT:* ₹${(order.totalAmount || 0).toLocaleString()}
----------------------------------------
Thank you for shopping at *LUFO CLOTHING ATELIER*!
Support: contact@lufoclothing.com | +91 800-583-6276`;
  };

  // 2. Download as High-Resolution PNG Image
  const handleDownloadImage = async () => {
    const node = document.getElementById('printable-invoice');
    if (!node) return;

    try {
      setIsExportingImage(true);
      showToast('Generating high-resolution invoice image...');

      // Generate 2x crisp PNG for razor-sharp typography
      const dataUrl = await toPng(node, {
        quality: 1,
        pixelRatio: 2.5,
        backgroundColor: '#ffffff',
        cacheBust: true,
      });

      const link = document.createElement('a');
      link.download = `LUFO-Invoice-${order.billNumber}.png`;
      link.href = dataUrl;
      link.click();
      showToast(`Invoice saved as image (${order.billNumber}.png)!`);
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

  // 6. Native Share (or share image file if supported)
  const handleNativeShare = async () => {
    const node = document.getElementById('printable-invoice');
    if (node && navigator.canShare) {
      try {
        const dataUrl = await toPng(node, { quality: 1, pixelRatio: 2, backgroundColor: '#ffffff' });
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], `LUFO-Invoice-${order.billNumber}.png`, { type: 'image/png' });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `Invoice ${order.billNumber} - LUFO Clothing`,
            text: `Boutique invoice for order ${order.billNumber} (Total: ₹${(order.totalAmount || 0).toLocaleString()})`,
          });
          showToast('Invoice shared successfully!');
          return;
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          // Fallback to text share
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

  // 7. Email Receipt
  const handleShareEmail = () => {
    const subject = encodeURIComponent(`Your Boutique Invoice - ${order.billNumber} | LUFO Clothing`);
    const body = encodeURIComponent(generateReceiptText());
    const email = order.customer?.email || '';
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  return (
    <Modal
      isOpen={!!order}
      onClose={onClose}
      title={`Boutique Invoice - ${order.billNumber}`}
      subtitle="Official LUFO Clothing customer bill and store invoice receipt"
      maxWidth="max-w-3xl"
    >
      <div className="space-y-4">
        {/* Actions & Sharing Toolbar (hidden on print) */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900 text-white shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Status:</span>
            <OrderStatusBadge status={order.status} />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Download as Image */}
            <button
              type="button"
              onClick={handleDownloadImage}
              disabled={isExportingImage}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
              title="Download invoice directly as a PNG image"
            >
              {isExportingImage ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileImage className="w-3.5 h-3.5" />
              )}
              <span>{isExportingImage ? 'Generating...' : 'Download Image'}</span>
            </button>

            {/* WhatsApp Share */}
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              title="Share invoice directly to customer's WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            {/* Share / More */}
            <button
              type="button"
              onClick={handleNativeShare}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 shadow-2xs cursor-pointer"
              title="Share via installed apps"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>

            {/* Copy Summary */}
            <button
              type="button"
              onClick={handleCopyText}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 shadow-2xs cursor-pointer"
              title="Copy invoice text to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>

            {/* Print / Save as PDF */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 shadow-2xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>

        {/* The Printable / Exportable Invoice Container */}
        <div
          id="printable-invoice"
          className="p-4 sm:p-8 rounded-2xl bg-white text-slate-900 shadow-xl border border-slate-200 font-sans"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6 pb-6 border-b-2 border-slate-900">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-black text-amber-400 flex items-center justify-center font-sans font-bold text-sm tracking-wider">
                  LF
                </div>
                <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-wider text-black">
                  LUFO CLOTHING
                </h1>
              </div>
              <p className="text-[10px] sm:text-[11px] font-semibold tracking-widest text-amber-700 uppercase mt-1">
                Haute Couture & Ready-to-Wear Atelier
              </p>
              <div className="text-xs text-slate-600 mt-2 space-y-0.5">
                <p>LUFO Flagship Studio, Luxury Avenue</p>
                <p>contact@lufoclothing.com | Support: +91 (0) 800-583-6276</p>
              </div>
            </div>

            <div className="text-left sm:text-right w-full sm:w-auto">
              <div className="inline-block px-3 py-1 rounded bg-black text-white text-xs font-mono font-bold tracking-wider uppercase mb-2">
                Invoice
              </div>
              <div className="font-mono text-base font-bold text-slate-900">
                {order.billNumber}
              </div>
              <div className="text-xs text-slate-600 mt-1">Date: {formattedDate}</div>
              <div className="text-xs text-slate-600">
                Payment: <span className="font-semibold text-slate-900">{order.paymentMethod}</span> ({order.paymentStatus})
              </div>
            </div>
          </div>

          {/* Customer Bill To Block */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 my-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="font-bold text-slate-900 uppercase tracking-wider block mb-1">
                Billed & Delivered To:
              </span>
              <p className="font-semibold text-slate-900 text-sm">{order.customer?.name}</p>
              {order.customer?.address && (
                <p className="text-slate-600 mt-0.5 whitespace-pre-line">{order.customer?.address}</p>
              )}
              <p className="text-slate-600 mt-1">Phone: {order.customer?.phone}</p>
              {order.customer?.email && <p className="text-slate-600">Email: {order.customer.email}</p>}
            </div>

            <div className="text-left sm:text-right flex flex-col justify-between">
              <div>
                <span className="font-bold text-slate-900 uppercase tracking-wider block mb-1">
                  Dispatch Status
                </span>
                <span className="inline-block px-2.5 py-0.5 rounded font-bold text-xs bg-slate-900 text-white">
                  {order.status}
                </span>
              </div>
              {order.notes && (
                <div className="mt-2 text-left bg-white p-2 rounded border border-slate-200 text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-800">Note: </span>
                  {order.notes}
                </div>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto custom-scrollbar my-6">
            <table className="w-full text-left text-xs border-collapse min-w-[480px]">
              <thead>
                <tr className="border-b-2 border-slate-300 bg-slate-100 text-slate-800 font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Apparel Item & SKU</th>
                  <th className="py-2.5 px-3 text-center">Size / Variant</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {(order.items || []).map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 px-3 font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{item.name}</div>
                      {item.sku && <div className="text-[10px] text-slate-500 font-mono">SKU: {item.sku}</div>}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-slate-200 font-medium text-slate-800 text-[11px]">
                        {item.size || 'M'} {item.color ? `• ${item.color}` : ''}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono">₹{(item.price || 0).toLocaleString()}</td>
                    <td className="py-3 px-3 text-center font-semibold">{item.quantity}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      ₹{(item.total || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="flex justify-end pt-4 border-t border-slate-200">
            <div className="w-full sm:w-64 space-y-1.5 text-xs text-slate-700">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold">₹{(order.subtotal || 0).toLocaleString()}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount Applied:</span>
                  <span className="font-mono font-semibold">-₹{order.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t-2 border-slate-900 text-sm font-bold text-slate-900">
                <span>Total Amount:</span>
                <span className="font-mono text-base text-black">
                  ₹{(order.totalAmount || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Footer & Signature */}
          <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 items-end text-xs text-slate-500">
            <div>
              <p className="font-semibold text-slate-800">Terms & Conditions:</p>
              <ul className="list-disc pl-4 space-y-0.5 text-[10px] mt-1">
                <li>Exchange allowed within 14 days with original tags intact.</li>
                <li>Custom-tailored and bespoke items are non-refundable.</li>
                <li>Care instruction: Dry clean only for luxury silks & wools.</li>
              </ul>
            </div>

            <div className="text-left sm:text-right">
              <div className="font-serif italic text-sm text-slate-800 mb-1">LUFO Atelier Authorised</div>
              <div className="border-t border-slate-400 pt-1 text-[10px] text-slate-500">
                Authorized Signatory & Stamp
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
