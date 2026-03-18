import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SkipForward, Volume2, VolumeX } from 'lucide-react';

interface VideoAdPlayerProps {
  /** YouTube video ID for the main promotional video (60-second ad) */
  adVideoId: string;
  /** Optional: YouTube video ID for post-ad main content */
  mainVideoId?: string;
  /** Title shown on the ad overlay */
  adTitle?: string;
  /** Called when the modal is dismissed */
  onClose: () => void;
  /** Duration in seconds after which the skip button appears (default: 5) */
  skipAfterSeconds?: number;
  /** Total ad duration in seconds (default: 60) */
  adDuration?: number;
}

const VideoAdPlayer: React.FC<VideoAdPlayerProps> = ({
  adVideoId,
  mainVideoId,
  adTitle = 'Publicité',
  onClose,
  skipAfterSeconds = 5,
  adDuration = 60,
}) => {
  const [phase, setPhase] = useState<'ad' | 'main'>('ad');
  const [elapsed, setElapsed] = useState(0);
  const [canSkip, setCanSkip] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const remaining = Math.max(0, adDuration - elapsed);
  const skipCountdown = Math.max(0, skipAfterSeconds - elapsed);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (phase !== 'ad') return;

    intervalRef.current = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        if (next >= skipAfterSeconds) setCanSkip(true);
        if (next >= adDuration) {
          clearTimer();
          setPhase(mainVideoId ? 'main' : 'ad');
          if (!mainVideoId) onClose();
        }
        return next;
      });
    }, 1000);

    return clearTimer;
  }, [phase, skipAfterSeconds, adDuration, mainVideoId, onClose, clearTimer]);

  const handleSkip = () => {
    clearTimer();
    if (mainVideoId) {
      setPhase('main');
    } else {
      onClose();
    }
  };

  const activeVideoId = phase === 'ad' ? adVideoId : (mainVideoId ?? adVideoId);
  const mutedParam = isMuted ? '&mute=1' : '';
  const videoSrc = `https://www.youtube.com/embed/${activeVideoId}?autoplay=1&rel=0&modestbranding=1${mutedParam}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 md:p-10"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        className="absolute top-4 right-4 md:top-8 md:right-8 text-white/50 hover:text-white transition-colors"
        onClick={onClose}
        aria-label="Fermer"
      >
        <X className="w-8 h-8 md:w-10 md:h-10" />
      </button>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Video iframe */}
        <iframe
          key={`${activeVideoId}-${phase}`}
          width="100%"
          height="100%"
          src={videoSrc}
          title={phase === 'ad' ? adTitle : 'Vidéo principale'}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />

        {/* Ad overlay controls — only shown during the ad phase */}
        <AnimatePresence>
          {phase === 'ad' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"
            >
              {/* Ad label + countdown */}
              <div className="flex flex-col gap-1 pointer-events-none">
                <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-400 bg-black/60 px-2 py-0.5 rounded w-fit">
                  {adTitle}
                </span>
                <span className="text-xs text-white/70">
                  Publicité : {remaining}s restantes
                </span>
                {/* Progress bar */}
                <div className="h-1 w-32 bg-white/20 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-brand-red transition-all duration-1000"
                    style={{ width: `${Math.min((elapsed / adDuration) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Controls: mute toggle + skip */}
              <div className="flex items-center gap-2 pointer-events-auto">
                <button
                  onClick={() => setIsMuted((m) => !m)}
                  className="p-2 rounded-full bg-black/50 text-white/80 hover:text-white hover:bg-black/70 transition-all"
                  aria-label={isMuted ? 'Activer le son' : 'Couper le son'}
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>

                {canSkip ? (
                  <button
                    onClick={handleSkip}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-slate-900 text-xs font-bold hover:bg-gray-100 transition-all shadow-lg"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                    Passer l'annonce
                  </button>
                ) : (
                  <span className="px-3 py-1.5 rounded-full bg-black/60 text-white/70 text-xs font-semibold border border-white/20">
                    Passer dans {skipCountdown}s
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default VideoAdPlayer;
