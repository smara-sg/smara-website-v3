import { useEffect, useRef, useState } from 'react';
import { Copy, Download, X } from 'lucide-react';
import { publicFilterUrl } from '../ar/filterLinks';
import { drawQrCode } from '../ar/qr';

export default function FilterQrDialog({ name, slug, onClose }: { name: string; slug: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [jpegUrl, setJpegUrl] = useState('');
  const [message, setMessage] = useState('');
  const url = publicFilterUrl(slug);

  useEffect(() => {
    const modal = dialog.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    modal?.showModal();
    return () => {
      modal?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    let active = true;
    let objectUrl = '';
    try {
      if (!canvas.current) return;
      drawQrCode(canvas.current, url);
      canvas.current.toBlob(blob => {
        if (!active || !blob) return;
        objectUrl = URL.createObjectURL(blob);
        setJpegUrl(objectUrl);
      }, 'image/jpeg', 1);
    } catch { setMessage('The QR code could not be created. Please try again.'); }
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [url]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setMessage('Link copied.');
    } catch { setMessage('Select and copy the link below.'); }
  }

  return (
    <dialog ref={dialog} aria-labelledby="filter-qr-title" onCancel={event => { event.preventDefault(); onClose(); }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[min(26rem,calc(100vw-2rem))] overflow-y-auto rounded-3xl bg-white p-6 text-ink shadow-xl backdrop:bg-black/60">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 text-left">
          <h2 id="filter-qr-title" className="text-xl font-semibold">{name}</h2>
          <p className="mt-1 text-sm text-mute">Scan to open this AR experience.</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close QR code" className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-mist"><X size={20} /></button>
      </div>
      <canvas ref={canvas} role="img" aria-label={`QR code for ${name}`} className="mx-auto my-4 block h-auto w-full max-w-72" />
      <label htmlFor="filter-public-link" className="mb-2 block text-left text-sm font-medium">Filter link</label>
      <input id="filter-public-link" readOnly value={url} onFocus={event => event.currentTarget.select()} className="field text-sm" />
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={copyLink} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-mist px-5 text-base"><Copy size={18} />Copy link</button>
        {jpegUrl && <a href={jpegUrl} download={`smara-${slug}-qr.jpg`} className="btn-primary"><Download size={18} />Save JPEG</a>}
      </div>
      {message && <p role="status" className="mt-3 text-sm">{message}</p>}
    </dialog>
  );
}
