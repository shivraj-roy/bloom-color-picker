import { ApiReference } from "../components/api-reference";
import { Playground } from "../components/playground";
import { Sidebar } from "../components/sidebar";

export default function Home() {
   return (
      <div className="page">
         <main className="bento">
            <Sidebar />

            <Playground />

            <div className="lofi lofi--code">
               CODE
               <br />
               live JSX for current config
            </div>

            <ApiReference />
         </main>

         <div className="footer-strip">@your-x-handle</div>
      </div>
   );
}
