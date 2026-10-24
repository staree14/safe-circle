import React, { useState, useEffect } from 'react';
import { Play, Pause, Mic, ShieldCheck, Copy, Check } from 'lucide-react';
import { useGuardian } from '../../context/GuardianContext';

interface AudioWaveformCardProps {
  filename?: string;
  duration?: string;
  sha256?: string;
}

export const AudioWaveformCard: React.FC<AudioWaveformCardProps> = ({
  filename = 'ambient_cab_audio_01.webm',
  duration = '0:14',
  sha256 = '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
}) => {
  const { addToast } = useGuardian();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSeconds, setCurrentSeconds] = useState(0);
  const [copied, setCopied] = useState(false);

  const totalSeconds = 14;

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentSeconds((prev) => {
          if (prev >= totalSeconds) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(sha256);
    setCopied(true);
    addToast({
      title: 'SHA-256 Digest Copied',
      message: 'Cryptographic audio signature copied to clipboard.',
      type: 'info',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const waveBars = [
    30, 45, 65, 85, 95, 60, 40, 75, 88, 52, 35, 70, 85, 92, 64, 42, 58, 80, 68, 48,
    72, 86, 90, 62, 38, 55, 78, 84, 50, 66, 82, 94, 70, 45, 60, 85, 75, 52, 40, 65
  ];

  return (
    <div className="bg-[#FFFFFF] border border-[#E8DFDA] rounded-2xl p-4 shadow-xs space-y-3">
      {/* Top Header Strip */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#FDECEE] text-[#C84B53] border border-[#F7D0D4]">
            <Mic className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#1F1A1C]">
                Live Audio Stream
              </span>
              <span className="text-[10px] font-mono text-[#6E6265]">
                ({filename})
              </span>
            </div>
            <span className="text-[11px] text-[#6E6265]">
              Cabin directional microphone • 0:14 buffer
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-[#2D6A4F] bg-[#E8F5E9] px-2 py-0.5 rounded border border-[#C8E6C9] flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            SHA-256 Sealed
          </span>
          <button
            onClick={handleCopyHash}
            className="p-1 rounded-lg bg-[#FAF6F3] hover:bg-[#F3ECE8] text-[#6E6265] text-[10px] font-semibold transition-colors flex items-center gap-1 border border-[#E8DFDA]"
            title="Copy SHA-256 hash"
          >
            {copied ? <Check className="w-3 h-3 text-[#2D6A4F]" /> : <Copy className="w-3 h-3" />}
            <span className="hidden sm:inline">Copy Seal</span>
          </button>
        </div>
      </div>

      {/* Compact Waveform & Play Control */}
      <div className="bg-[#FAF6F3] rounded-xl p-3 border border-[#E8DFDA] flex items-center gap-3">
        <button
          onClick={handleTogglePlay}
          className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#C84B53] hover:bg-[#A8323B] text-white transition-all shadow-xs shrink-0 cursor-pointer"
          title={isPlaying ? 'Pause playback' : 'Play audio'}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </button>

        {/* Animated Waveform Bars */}
        <div className="flex-1 h-9 flex items-center justify-between gap-0.5 px-2 bg-[#FFFFFF] rounded-lg border border-[#E8DFDA] overflow-hidden">
          {waveBars.map((height, idx) => {
            const isActive = (idx / waveBars.length) * totalSeconds <= currentSeconds;
            return (
              <div
                key={idx}
                style={{
                  height: `${isPlaying ? Math.max(20, Math.min(100, height * (0.8 + Math.random() * 0.4))) : height * 0.7}%`,
                }}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isActive
                    ? 'bg-[#C84B53]'
                    : isPlaying
                    ? 'bg-[#E8DFDA]'
                    : 'bg-[#D9CFC9]'
                }`}
              />
            );
          })}
        </div>

        {/* Timer */}
        <div className="text-right shrink-0">
          <span className="font-mono text-xs font-bold text-[#1F1A1C] tabular-nums block">
            0:{currentSeconds.toString().padStart(2, '0')} / {duration}
          </span>
          <span className="text-[10px] text-[#2D6A4F] font-bold block">
            Intact
          </span>
        </div>
      </div>
    </div>
  );
};
