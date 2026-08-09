import { Playground } from "../components/playground";
import { PropsTable } from "../components/props-table";
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

            <PropsTable />
         </main>

         <div className="footer-strip">@your-x-handle</div>
      </div>
   );
}
