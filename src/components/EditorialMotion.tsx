import React, { useEffect, useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";

export function EditorialScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 105,
    damping: 26,
    mass: 0.24,
  });

  return (
    <motion.div
      className="editorial-scroll-progress no-print"
      style={{ scaleX, transformOrigin: "0% 50%" }}
      aria-hidden="true"
    />
  );
}

export function EditorialRevealObserver() {
  const reducedMotion = useReducedMotion();
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const selector = [
      "main .essay-stage-title",
      "main .essay-cover-title",
      "main .essay-section-title",
      "main .essay-lead",
      "main .essay-figure-stage",
      "main figure",
      "main [data-editorial-reveal]",
      "main [data-editorial-stagger]",
    ].join(",");

    const reveal = (node: HTMLElement) => {
      node.classList.add("editorial-is-visible");
      observerRef.current?.unobserve(node);
    };

    const revealInOrAboveViewport = (node: HTMLElement) => {
      const rect = node.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.96) {
        reveal(node);
        return true;
      }
      return false;
    };

    const attach = (root: ParentNode = document) => {
      root.querySelectorAll<HTMLElement>(selector).forEach((node) => {
        if (node.dataset.editorialObserved === "true") return;
        node.dataset.editorialObserved = "true";

        // Keep sticky elements un-transformed so position: sticky always stays active
        if (reducedMotion || node.classList.contains("lg:sticky")) {
          reveal(node);
          return;
        }

        if (revealInOrAboveViewport(node)) {
          reveal(node);
        } else {
          node.classList.add("editorial-reveal-ready");
          observerRef.current?.observe(node);
        }
      });
    };

    const sweepVisible = () => {
      document
        .querySelectorAll<HTMLElement>(".editorial-reveal-ready:not(.editorial-is-visible)")
        .forEach((node) => {
          revealInOrAboveViewport(node);
        });
    };

    if (!reducedMotion) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting || entry.boundingClientRect.top < window.innerHeight * 0.96) {
              reveal(entry.target as HTMLElement);
            }
          });
        },
        { threshold: 0, rootMargin: "40px 0px -4% 0px" },
      );
    }

    attach();

    let rafId = 0;
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        sweepVisible();
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    const main = document.querySelector("main");
    const mutations = main
      ? new MutationObserver((records) => {
          let addedAny = false;
          records.forEach((record) => {
            record.addedNodes.forEach((added) => {
              if (added instanceof HTMLElement) {
                addedAny = true;
                attach(added);
                if (added.matches?.(selector)) attach(added.parentElement ?? document);
              }
            });
          });
          if (addedAny) {
            requestAnimationFrame(sweepVisible);
            window.setTimeout(sweepVisible, 260);
          }
        })
      : null;

    mutations?.observe(main!, { childList: true, subtree: true });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      observerRef.current?.disconnect();
      observerRef.current = null;
      mutations?.disconnect();
    };
  }, [reducedMotion]);

  return null;
}

export function EditorialAtmosphere() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="editorial-atmosphere no-print" aria-hidden="true">
      <motion.div
        className="editorial-atmosphere__orb editorial-atmosphere__orb--one"
        animate={reducedMotion ? undefined : {
          x: [0, 42, -16, 0],
          y: [0, 26, 46, 0],
          scale: [1, 1.08, .96, 1],
        }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="editorial-atmosphere__orb editorial-atmosphere__orb--two"
        animate={reducedMotion ? undefined : {
          x: [0, -32, 18, 0],
          y: [0, -18, 24, 0],
        }}
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="editorial-atmosphere__grain" />
    </div>
  );
}

export function EditorialPageTransition({
  pageKey,
  children,
}: {
  pageKey: string;
  children: React.ReactNode;
}) {
  const reducedMotion = useReducedMotion();
  const shellRef = useRef<HTMLDivElement>(null);
  const isFirstMount = useRef(true);

  useEffect(() => {
    const shell = shellRef.current;
    if (shell && !reducedMotion) {
      shell.classList.remove("editorial-page-enter");
      void shell.offsetWidth;
      shell.classList.add("editorial-page-enter");

      const remove = () => shell.classList.remove("editorial-page-enter");
      shell.addEventListener("animationend", remove, { once: true });

      if (isFirstMount.current) {
        isFirstMount.current = false;
        return () => shell.removeEventListener("animationend", remove);
      }

      if (!window.location.hash.includes("/")) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      return () => shell.removeEventListener("animationend", remove);
    }

    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    if (!window.location.hash.includes("/")) {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [pageKey, reducedMotion]);

  return (
    <div ref={shellRef} className="editorial-page-shell" data-page={pageKey}>
      {children}
    </div>
  );
}

export function ChapterKicker({
  number,
  label,
  centered = false,
}: {
  number: string;
  label: string;
  centered?: boolean;
}) {
  return (
    <div className={`editorial-kicker ${centered ? "justify-center" : ""}`}>
      <span className="editorial-kicker__number">{number}</span>
      <span className="editorial-kicker__line" aria-hidden="true" />
      <span className="editorial-kicker__label">{label}</span>
    </div>
  );
}
