"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

import { AnnotationArrowIcon } from "../components/annotations/annotation-arrow-icon";
import { ApiReference } from "../components/api-reference";
import { BlueprintAngleGuide } from "../components/blueprint-angle-guide";
import { FlowerVideo } from "../components/flower-video";
import { Preloader } from "../components/preloader";

// arrow (56px) + "The Crafter" in the handwritten font, whichever is wider,
// plus its 30px left margin — the annotation scales down proportionally to
// however much of this it actually gets, down to MIN_SCALE, below which
// it's not rendered at all (a sliver that small reads as broken, not cute).
const FOOTER_ANNOTATION_COMFORTABLE_MARGIN = 160;
const FOOTER_ANNOTATION_MIN_SCALE = 0.55;

// these read persisted settings from localStorage on first render —
// rendering them only on the client (no SSR) means there's no server-
// rendered "default" HTML to flash before the real, persisted values show up.
const Playground = dynamic(() => import("../components/playground").then((m) => m.Playground), {
   ssr: false,
   loading: () => <div className="box playground" />,
});
const Sidebar = dynamic(() => import("../components/sidebar").then((m) => m.Sidebar), {
   ssr: false,
   loading: () => <div className="box sidebar" />,
});

export default function Home() {
   const linkRef = useRef<HTMLAnchorElement>(null);
   const [scale, setScale] = useState(0);

   // measured and scaled to fit rather than a binary show/hide — unlike
   // opacity, transform:scale() genuinely shrinks the element's contribution
   // to the page's scrollable width, so this can't cause the horizontal
   // scroll a plain opacity toggle did whenever blueprint mode was on.
   useEffect(() => {
      const link = linkRef.current;
      if (!link) return;

      const measure = () => {
         const rect = link.getBoundingClientRect();
         const margin = window.innerWidth - rect.right;
         const next = Math.min(1, margin / FOOTER_ANNOTATION_COMFORTABLE_MARGIN);
         setScale(next < FOOTER_ANNOTATION_MIN_SCALE ? 0 : next);
      };

      measure();
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
   }, []);

   return (
      <div className="page">
         <Preloader />

         <BlueprintAngleGuide />

         <main className="bento">
            <Sidebar />

            <Playground />

            <FlowerVideo />

            <ApiReference />
         </main>

         <div className="footer-strip">
            <span>
               {"Built by "}
               <a href="https://x.com/shivraj_roy10" target="_blank" rel="noreferrer" ref={linkRef}>
                  Shivraj…
                  {scale > 0 && (
                     <span
                        className="footer-annotation"
                        aria-hidden="true"
                        style={{ transform: `translateY(-70%) rotate(-4deg) scale(${scale})` }}
                     >
                        <AnnotationArrowIcon width={56} height={19} />
                        <span className="footer-annotation__text">The Crafter</span>
                     </span>
                  )}
               </a>
            </span>
         </div>
      </div>
   );
}
