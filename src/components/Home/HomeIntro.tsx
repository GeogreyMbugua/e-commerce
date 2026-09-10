"use client";

import { useEffect, useRef, useState } from "react";
import Hero from "./Hero";
import Categories from "./Categories";

const INTRO_DELAY_MS = 2200;

export type IntroPhase = "brand" | "shop";

const HomeIntro = () => {
  const [phase, setPhase] = useState<IntroPhase>("brand");
  const [interrupted, setInterrupted] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const abortedRef = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotionPreference = () => {
      const prefersReduced = mediaQuery.matches;
      setReduceMotion(prefersReduced);
      if (prefersReduced) {
        abortedRef.current = true;
      }
    };

    syncMotionPreference();
    mediaQuery.addEventListener("change", syncMotionPreference);

    if (mediaQuery.matches) {
      return () => mediaQuery.removeEventListener("change", syncMotionPreference);
    }

    const abort = () => {
      if (abortedRef.current) return;
      abortedRef.current = true;
      setInterrupted(true);
    };

    const onScroll = () => {
      if (window.scrollY > 8) abort();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", abort, { passive: true });
    window.addEventListener("touchmove", abort, { passive: true });
    window.addEventListener("pointerdown", abort);

    const timer = window.setTimeout(() => {
      if (!abortedRef.current) {
        setPhase("shop");
      }
    }, INTRO_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", abort);
      window.removeEventListener("touchmove", abort);
      window.removeEventListener("pointerdown", abort);
      mediaQuery.removeEventListener("change", syncMotionPreference);
    };
  }, []);

  const collapsed = phase === "shop" && !reduceMotion;
  const categoriesRevealed = phase === "shop" || interrupted || reduceMotion;

  return (
    <>
      <Hero collapsed={collapsed} />
      <Categories revealed={categoriesRevealed} />
    </>
  );
};

export default HomeIntro;
