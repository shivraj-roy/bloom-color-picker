import { ApiReference } from "../components/api-reference";
import { FlowerVideo } from "../components/flower-video";
import { Playground } from "../components/playground";
import { Sidebar } from "../components/sidebar";

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
