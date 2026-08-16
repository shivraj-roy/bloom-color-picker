"use client";

import dynamic from "next/dynamic";

import { ApiReference } from "../components/api-reference";
import { FlowerVideo } from "../components/flower-video";

// these two read persisted settings from localStorage on first render —
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
   return (
      <div className="page">
         <main className="bento">
            <Sidebar />

            <Playground />

            <FlowerVideo />

            <ApiReference />
         </main>

         <div className="footer-strip">@your-x-handle</div>
      </div>
   );
}
