"use client";

import Image from "@/components/Common/BrandedImage";

const PreLoader = () => {
  return (
    <div className="fixed inset-0 z-[999999] flex min-h-screen w-screen items-center justify-center overflow-hidden bg-brand-cream">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-gold/10 blur-3xl" />

      <div className="relative flex flex-col items-center">
        {/* Audio / vinyl ring */}
        <div className="relative flex h-56 w-56 items-center justify-center">
          {/* Outer rotating ring */}
          <div
            className="
              absolute inset-2
              rounded-full
              border border-brand-rust/20
              animate-[spin_8s_linear_infinite]
            "
          />

          {/* Dashed inner groove */}
          <div
            className="
              absolute inset-6
              rounded-full
              border border-dashed border-brand-gold/35
              animate-[spin_12s_linear_infinite_reverse]
            "
          />

          {/* Audio-wave decorative arcs */}
          <div className="absolute inset-10 rounded-full border border-brand-teal/15" />

          {/* Soft glow */}
          <div
            className="
              absolute inset-12
              rounded-full
              bg-brand-gold/10
              blur-2xl
              animate-pulse
            "
          />

          {/* Logo */}
          <div className="relative z-10 h-[150px] w-[200px] animate-pulse">
            <Image
              src="/images/logo/vintage.png"
              alt="Vintage Audio"
              fill
              priority
              sizes="200px"
              className="object-contain"
            />
          </div>
        </div>

        {/* Equalizer */}
        <div className="mt-2 flex h-8 items-end justify-center gap-1.5">
          <span className="h-2 w-1 animate-pulse rounded-full bg-brand-rust" />
          <span className="h-4 w-1 animate-pulse rounded-full bg-brand-gold [animation-delay:100ms]" />
          <span className="h-7 w-1 animate-pulse rounded-full bg-brand-teal [animation-delay:200ms]" />
          <span className="h-3 w-1 animate-pulse rounded-full bg-brand-rust [animation-delay:150ms]" />
          <span className="h-6 w-1 animate-pulse rounded-full bg-brand-gold [animation-delay:50ms]" />
          <span className="h-4 w-1 animate-pulse rounded-full bg-brand-teal [animation-delay:250ms]" />
          <span className="h-5 w-1 animate-pulse rounded-full bg-brand-rust [animation-delay:120ms]" />
        </div>

        {/* Loading label */}
        <div className="mt-5 flex items-center gap-2">
          <span className="text-[10px] font-medium uppercase tracking-[0.35em] text-brand-ink/50">
            Tuning In
          </span>

          <span className="flex gap-1">
            <span className="h-1 w-1 animate-pulse rounded-full bg-brand-rust" />
            <span className="h-1 w-1 animate-pulse rounded-full bg-brand-gold [animation-delay:150ms]" />
            <span className="h-1 w-1 animate-pulse rounded-full bg-brand-teal [animation-delay:300ms]" />
          </span>
        </div>
      </div>

    </div>
  );
};

export default PreLoader;