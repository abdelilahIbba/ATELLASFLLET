/**
 * DocumentScanner.tsx
 *
 * A free, in-browser document scanner inspired by CardScan.ai's UX.
 * Uses react-webcam for the live camera feed and Tesseract.js for OCR.
 *
 * Props mirror CardScan.ai's interface so the integration feels familiar:
 *   onSuccess(result)  — called with extracted data when scan succeeds
 *   onError(err)       — called on camera/OCR error
 *   onCancel()         — called when user dismisses the scanner
 *   documentType       — 'id' | 'license' | 'face'
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, RefreshCw, CheckCircle, Loader2, AlertCircle, ShieldAlert, Info } from 'lucide-react';
import { extractDocumentData, OcrResult } from '../../services/ocrUtils';

export interface DocumentScanResult extends OcrResult {
  imageDataUrl: string;
  imageFile: File;
}

interface DocumentScannerProps {
  documentType: 'id' | 'license' | 'face';
  onSuccess: (result: DocumentScanResult) => void;
  onError?: (err: Error) => void;
  onCancel: () => void;
}

const LABELS: Record<DocumentScannerProps['documentType'], { title: string; hint: string }> = {
  id:      { title: 'Carte Nationale',     hint: 'Centrez le recto de votre CIN dans le cadre' },
  license: { title: 'Permis de Conduire',  hint: 'Centrez votre permis dans le cadre' },
  face:    { title: 'Photo Client',         hint: 'Centrez votre visage dans le cadre' },
};

type Phase = 'checking' | 'permission-ask' | 'permission-denied' | 'preview' | 'processing' | 'success' | 'error';

const DocumentScanner: React.FC<DocumentScannerProps> = ({
  documentType,
  onSuccess,
  onError,
  onCancel,
}) => {
  const videoRef  = useRef<HTMLVideoElement>(null);
  /** Ref on the visible card/face overlay frame — used to crop captures to
   *  just the document region before OCR, eliminating background noise. */
  const frameRef  = useRef<HTMLDivElement>(null);
  /**
   * Holds the live MediaStream.  We own this stream (not react-webcam) so we
   * can acquire it directly inside the tap-handler — which is mandatory on
   * iOS Safari.  iOS enforces that getUserMedia() is called within the same
   * synchronous call-stack as a user gesture (tap/click).  react-webcam calls
   * getUserMedia() from componentDidMount / useEffect, which runs *after* the
   * React render cycle and is no longer considered a user gesture by Safari.
   */
  const streamRef = useRef<MediaStream | null>(null);
  const [phase, setPhase] = useState<Phase>('checking');
  const [errorMsg, setErrorMsg] = useState('');
  const [ocrPct, setOcrPct] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);

  const label = LABELS[documentType];
  const isDoc = documentType !== 'face';

  // ── Platform detection ────────────────────────────────────────────────────
  const isIOS     = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isAndroid = /Android/i.test(navigator.userAgent);

  // ── Camera facing mode ────────────────────────────────────────────────────
  const facingMode = documentType === 'face' ? 'user' : 'environment';

  // ── Shared stream acquisition ─────────────────────────────────────────────
  // Centralised so both the silent pre-check (desktop, already-granted) and
  // the explicit button tap (iOS) use identical constraints.
  const acquireStream = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        // On iOS Safari, extra constraints (width/height ideal) can cause
        // getUserMedia to fail on certain device/OS combinations — facingMode
        // alone is sufficient and safest.
        video: isIOS
          ? { facingMode }
          : { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraReady(false);
      setPhase('preview');
      return true;
    } catch (err) {
      const name = err instanceof Error ? err.name : '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setPhase('permission-denied');
      } else {
        setErrorMsg(err instanceof Error ? err.message : "Erreur lors de l'accès à la caméra.");
        setPhase('error');
      }
      return false;
    }
  }, [facingMode]);

  // ── Camera permission pre-flight (runs on mount) ──────────────────────────
  // If permission is already granted we can acquire the stream here without a
  // user gesture (no dialog will appear).  Otherwise show the consent card so
  // the actual getUserMedia call happens inside a tap handler.
  useEffect(() => {
    const checkPermission = async () => {
      if ('permissions' in navigator) {
        try {
          const status = await navigator.permissions.query({ name: 'camera' as PermissionName });
          if (status.state === 'granted') {
            // Already granted: acquire stream without needing a user gesture
            await acquireStream();
            return;
          }
          if (status.state === 'denied') { setPhase('permission-denied'); return; }
        } catch {
          // Permissions API unavailable (iOS Safari) — fall through
        }
      }
      // 'prompt' state or API missing → show consent card
      setPhase('permission-ask');
    };
    checkPermission();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Attach MediaStream to <video> element when preview phase starts ───────
  useEffect(() => {
    const video  = videoRef.current;
    const stream = streamRef.current;
    if (phase === 'preview' && video && stream) {
      if (video.srcObject !== stream) {
        video.srcObject = stream;
      }
      // play() can throw if the user hasn't interacted yet; we ignore that
      // because autoPlay + playsInline handles it on most devices.
      video.play().catch(() => {});
      // If metadata is already available (stream was already attached earlier)
      // set cameraReady immediately so the capture button shows.
      if (video.readyState >= 1) setCameraReady(true);
    }
  }, [phase]);

  // ── Cleanup: stop all camera tracks when the scanner unmounts ────────────
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    };
  }, []);

  /**
   * Called when the user taps "Autoriser l'accès à la caméra".
   *
   * CRITICAL for iOS Safari: getUserMedia MUST be called within the same
   * synchronous call-stack as a user tap.  By calling acquireStream() here —
   * directly inside an onClick handler — iOS considers this a user gesture and
   * shows the native camera permission dialog.
   */
  const handleRequestPermission = useCallback(async () => {
    await acquireStream();
  }, [acquireStream]);

  // ── Capture ───────────────────────────────────────────────────────────────
  const handleCapture = useCallback(async () => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    setPhase('processing');
    setOcrPct(0);

    try {
      // ── Crop capture to the visible card frame ────────────────────────────
      // Professional card-scanning SDKs (CardScan.ai et al.) all do this:
      // feed the OCR engine ONLY the card region — not hands, background, etc.
      // We use the overlay frame's bounding rect to compute the crop region
      // in native video-pixel coordinates.
      const natW = videoEl.videoWidth  || 1280;
      const natH = videoEl.videoHeight || 720;
      const vidRect   = videoEl.getBoundingClientRect();
      const frameRect = frameRef.current?.getBoundingClientRect();

      let cropX = 0, cropY = 0, cropW = natW, cropH = natH;
      if (frameRect && vidRect.width > 0 && vidRect.height > 0) {
        const sx = natW / vidRect.width;
        const sy = natH / vidRect.height;
        cropX = Math.max(0, (frameRect.left - vidRect.left) * sx);
        cropY = Math.max(0, (frameRect.top  - vidRect.top)  * sy);
        cropW = Math.min(natW - cropX, frameRect.width  * sx);
        cropH = Math.min(natH - cropY, frameRect.height * sy);
      }

      // Upscale to at least 1400 px wide — Tesseract accuracy improves
      // significantly with larger input images
      const TARGET_W = Math.max(1400, Math.round(cropW));
      const scale    = TARGET_W / cropW;
      const canvas   = document.createElement('canvas');
      canvas.width   = TARGET_W;
      canvas.height  = Math.round(cropH * scale);
      const ctx = canvas.getContext('2d')!;

      // Draw the raw video frame first (no CSS filter — ctx.filter is silently
      // ignored on iOS Safari < 18 so we cannot rely on it)
      ctx.drawImage(videoEl, cropX, cropY, cropW, cropH, 0, 0, canvas.width, canvas.height);

      // Manual grayscale + contrast boost via pixel manipulation — works on
      // every browser including old iOS Safari.
      // Luminosity-weighted grayscale + contrast stretch (÷128 pivot, ×1.45)
      // with a slight brightness lift makes dark/coloured card backgrounds
      // yield crisp black-on-white text that Tesseract reads well.
      try {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          const g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
          const c = Math.min(255, Math.max(0, Math.round((g - 128) * 1.45 + 140)));
          d[i] = d[i + 1] = d[i + 2] = c;
          // d[i+3] (alpha) unchanged
        }
        ctx.putImageData(imgData, 0, 0);
      } catch { /* cross-origin / security error — proceed with colour image */ }

      // PNG = lossless — avoids JPEG artefacts on thin ID card text
      const dataUrl = canvas.toDataURL('image/png');

      // Convert data-URL → File so Tesseract can consume it
      const res  = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `${documentType}_scan.png`, { type: 'image/png' });

      let ocrResult: OcrResult = { firstName: null, lastName: null, documentNumber: null, rawText: '' };
      if (isDoc) {
        ocrResult = await extractDocumentData(file, (pct) => setOcrPct(pct));
      }

      setPhase('success');
      setTimeout(() => {
        onSuccess({ ...ocrResult, imageDataUrl: dataUrl, imageFile: file });
      }, 600);

    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setErrorMsg(e.message || 'Erreur lors de la numérisation.');
      setPhase('error');
      onError?.(e);
    }
  }, [documentType, isDoc, onSuccess, onError]);

  const handleRetry = () => {
    setErrorMsg('');
    setOcrPct(0);
    // If the stream is still alive, mark camera ready immediately; otherwise
    // let the video's onLoadedMetadata fire once the browser catches up.
    if (streamRef.current?.active) {
      setCameraReady(true);
    } else {
      setCameraReady(false);
    }
    setPhase('preview');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black"
    >
      {/* ── Header ── */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 to-transparent">
        <div>
          <p className="text-white font-bold text-base">{label.title}</p>
          <p className="text-white/60 text-xs mt-0.5">{label.hint}</p>
        </div>
        <button
          onClick={onCancel}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* ── Checking permissions (initial silent probe) ── */}
      {phase === 'checking' && (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-white/40 animate-spin" />
        </div>
      )}

      {/* ── Permission consent (shown before native browser dialog) ── */}
      {phase === 'permission-ask' && (
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-7 max-w-sm w-full text-center">
            <div className="w-16 h-16 rounded-full bg-brand-blue/20 border border-brand-blue/30 flex items-center justify-center mx-auto mb-5">
              <Camera className="w-8 h-8 text-brand-blue" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Accès à la caméra requis</h3>
            <p className="text-white/60 text-sm mb-5 leading-relaxed">
              Pour numériser et valider vos documents d'identité, nous avons besoin d'accéder à votre caméra. Vos données sont traitées localement sur votre appareil.
            </p>
            <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-3 mb-6 text-left">
              <Info className="w-4 h-4 text-brand-blue mt-0.5 shrink-0" />
              <p className="text-white/50 text-xs leading-relaxed">
                Votre navigateur va afficher une demande d'autorisation. Appuyez sur{' '}
                <strong className="text-white/80">Autoriser</strong> pour continuer.
              </p>
            </div>
            <button
              onClick={handleRequestPermission}
              className="w-full py-3 bg-brand-blue text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-brand-blue/90 active:scale-95 transition-all"
            >
              <Camera className="w-4 h-4" /> Autoriser l'accès à la caméra
            </button>
            <button
              onClick={onCancel}
              className="mt-3 w-full py-2.5 text-white/40 text-sm hover:text-white/70 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* ── Permission denied — platform-specific step-by-step fix ── */}
      {phase === 'permission-denied' && (
        <div className="flex-1 flex items-center justify-center px-6 py-8 overflow-y-auto">
          <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-bold text-base leading-tight">Accès à la caméra bloqué</h3>
                <p className="text-white/45 text-xs mt-0.5">Réactivez-le depuis les paramètres</p>
              </div>
            </div>

            <div className="space-y-2 mb-5">
              {isIOS ? (
                <>
                  <p className="text-white/50 text-[11px] font-bold uppercase tracking-wider mb-3">Sur iPhone / iPad :</p>
                  {[
                    'Ouvrez Réglages (⚙️) sur votre appareil',
                    'Faites défiler et appuyez sur Safari (ou votre navigateur)',
                    'Appuyez sur Caméra → sélectionnez Autoriser',
                    'Revenez ici et appuyez sur Réessayer',
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-2.5 bg-white/5 rounded-lg px-3 py-2.5">
                      <span className="text-brand-blue font-bold text-xs shrink-0 mt-0.5">{i + 1}.</span>
                      <p className="text-white/70 text-xs leading-relaxed">{step}</p>
                    </div>
                  ))}
                </>
              ) : isAndroid ? (
                <>
                  <p className="text-white/50 text-[11px] font-bold uppercase tracking-wider mb-3">Sur Android :</p>
                  {[
                    "Appuyez sur l'icône 🔒 à gauche de la barre d'adresse",
                    'Appuyez sur Autorisations ou Paramètres du site',
                    'Trouvez Caméra → sélectionnez Autoriser',
                    'Revenez ici et appuyez sur Réessayer',
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-2.5 bg-white/5 rounded-lg px-3 py-2.5">
                      <span className="text-brand-blue font-bold text-xs shrink-0 mt-0.5">{i + 1}.</span>
                      <p className="text-white/70 text-xs leading-relaxed">{step}</p>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <p className="text-white/50 text-[11px] font-bold uppercase tracking-wider mb-3">Sur ordinateur / tablette :</p>
                  {[
                    "Cliquez sur l'icône 🔒 ou 📷 dans la barre d'adresse",
                    "Modifiez l'autorisation Caméra → Autoriser",
                    'Actualisez la page si besoin, puis réessayez',
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-2.5 bg-white/5 rounded-lg px-3 py-2.5">
                      <span className="text-brand-blue font-bold text-xs shrink-0 mt-0.5">{i + 1}.</span>
                      <p className="text-white/70 text-xs leading-relaxed">{step}</p>
                    </div>
                  ))}
                </>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleRequestPermission}
                className="flex-1 py-3 bg-white text-brand-navy rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <RefreshCw className="w-4 h-4" /> Réessayer
              </button>
              <button
                onClick={onCancel}
                className="flex-1 py-3 bg-white/10 text-white rounded-xl font-bold text-sm hover:bg-white/15 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Live camera feed (only rendered once permission is granted) ── */}
      {(['preview', 'processing', 'success', 'error'] as Phase[]).includes(phase) && (
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        {/*
          Plain <video> element — we own the MediaStream (in streamRef) and
          attach it via srcObject.  This is necessary because iOS Safari
          requires getUserMedia() to be called directly inside a user-gesture
          handler; any camera access initiated from a React useEffect / lifecycle
          method (as react-webcam does) is silently blocked by iOS.
        */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          onLoadedMetadata={() => setCameraReady(true)}
          className="w-full h-full object-cover"
        />

        {/* ── Document frame overlay ── */}
        {phase === 'preview' && cameraReady && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {isDoc ? (
              /* Landscape card frame */
              <div ref={frameRef} className="relative w-[88vw] max-w-sm" style={{ aspectRatio: '1.586' }}>
                {/* Dark mask outside the frame */}
                <div className="absolute inset-0 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] rounded-xl" />

                {/* Corner brackets */}
                {[
                  'top-0    left-0   border-t-4 border-l-4 rounded-tl-xl',
                  'top-0    right-0  border-t-4 border-r-4 rounded-tr-xl',
                  'bottom-0 left-0   border-b-4 border-l-4 rounded-bl-xl',
                  'bottom-0 right-0  border-b-4 border-r-4 rounded-br-xl',
                ].map((cls) => (
                  <div key={cls} className={`absolute w-8 h-8 border-white ${cls}`} />
                ))}

                {/* Scanning laser */}
                <motion.div
                  initial={{ top: '0%' }}
                  animate={{ top: '100%' }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                  className="absolute left-0 right-0 h-0.5 bg-brand-red shadow-[0_0_12px_3px_rgba(220,38,38,0.7)]"
                />
              </div>
            ) : (
              /* Circle frame for face */
              <div className="relative w-56 h-56">
                <div className="absolute inset-0 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] rounded-full" />
                <div className="absolute inset-0 border-4 border-white/80 rounded-full" />
                <motion.div
                  initial={{ top: '0%' }}
                  animate={{ top: '100%' }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                  className="absolute left-0 right-0 h-0.5 bg-brand-blue shadow-[0_0_12px_3px_rgba(59,130,246,0.7)]"
                />
              </div>
            )}
          </div>
        )}

        {/* ── Waiting for camera ── */}
        {phase === 'preview' && !cameraReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
            <p className="text-white/70 text-sm">Ouverture de la caméra…</p>
          </div>
        )}

        {/* ── Processing / OCR ── */}
        <AnimatePresence>
          {phase === 'processing' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 gap-5"
            >
              <Loader2 className="w-12 h-12 text-brand-blue animate-spin" />
              <p className="text-white font-bold text-base">
                {isDoc ? 'Lecture du document…' : 'Analyse de la photo…'}
              </p>
              {isDoc && (
                <div className="w-48">
                  <div className="flex justify-between mb-1">
                    <span className="text-white/60 text-xs">OCR</span>
                    <span className="text-white/60 text-xs">{ocrPct}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-1.5">
                    <motion.div
                      className="bg-brand-blue h-1.5 rounded-full"
                      animate={{ width: `${ocrPct}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Success flash ── */}
        <AnimatePresence>
          {phase === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-green-500/20"
            >
              <div className="bg-green-500 rounded-full p-5 shadow-2xl">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Error state ── */}
        <AnimatePresence>
          {phase === 'error' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-4 px-8"
            >
              <AlertCircle className="w-12 h-12 text-red-400" />
              <p className="text-white text-center text-sm">{errorMsg}</p>
              <div className="flex gap-3">
                <button
                  onClick={handleRetry}
                  className="px-5 py-2.5 bg-white text-brand-navy rounded-lg font-bold text-sm flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Réessayer
                </button>
                <button
                  onClick={onCancel}
                  className="px-5 py-2.5 bg-white/10 text-white rounded-lg font-bold text-sm"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      )}

      {/* ── Footer: Capture button ── */}
      {(phase === 'preview') && cameraReady && (
        <div className="absolute bottom-0 left-0 right-0 z-10 flex flex-col items-center gap-3 pb-10 pt-6 bg-gradient-to-t from-black/80 to-transparent">
          <button
            onClick={handleCapture}
            className="w-18 h-18 rounded-full border-4 border-white shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
            style={{ width: 72, height: 72 }}
          >
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center">
              <Camera className="w-6 h-6 text-brand-navy" />
            </div>
          </button>
          <p className="text-white/50 text-xs">Appuyez pour capturer</p>
        </div>
      )}
    </motion.div>
  );
};

export default DocumentScanner;
