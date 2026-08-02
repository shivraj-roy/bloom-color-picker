import { Sidebar } from "../components/sidebar";

export default function Home() {
   return (
      <div className="page">
         <main className="bento">
            <Sidebar />

            <div className="lofi lofi--playground">
               PLAYGROUND
               <br />
               live bloom + controls, one card
            </div>

            <div className="lofi lofi--code">
               CODE
               <br />
               live JSX for current config
            </div>

            <div className="lofi lofi--props">
               PROPS
               <br />
               compact reference table
            </div>
         </main>

         <div className="footer-strip">@your-x-handle</div>
      </div>
   );
}
