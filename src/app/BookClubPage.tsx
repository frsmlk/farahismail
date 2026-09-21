import type { Metadata } from 'next';

export const bookClubMetadata: Metadata = {
  title: 'Book Club',
  description: 'Book Club',
};

const availableBooks = [
  ['Magazine', 'POP Magazine: September Issue', 'POP Magazine', 'Available'],
  ['Book', 'The Spirit of Cities', 'Daniel A. Bell & Avner de-Shalit', 'Available'],
  ['Book', 'Design in Conservative Times', 'Joannette van der Veer', 'Available'],
  ['Book', 'Art and Beauty in the Middle Ages', 'Umberto Eco', 'Available'],
  ['Book', 'You Glow in the Dark', 'Liliana Colanzi', 'Available'],
  ['Book', 'Soups, Salads, Sandwiches', 'Matty Matheson', 'Available'],
  ['Magazine', 'Penang Monthly: September Issue', 'Penang Institute', 'Available'],
  ['Magazine', 'Noai Issue 4: Absurd Rituals', 'Noai', 'Available'],
  ['Book', 'Common Treasures Vol 2. Housing, Planning and Construction', 'Amica Dall, Giles Smith, James Binning & Sara Pereira', 'Available'],
  ['Book', 'Nyampah', 'Emte', 'Available'],
];

export default function BookClubPage() {
  return (
    <>
      <style>{`
        :root{
          --ink:#000000;
          --paper:#d0b6d7;
          --warm:#000000;
          --line:rgba(0,0,0,.28);
          --muted:#000000;
          --dim:#000000;
        }
        *{box-sizing:border-box;min-width:0}
        html{scroll-behavior:smooth;overflow-x:hidden}
        body{margin:0;background:var(--paper);color:#000000;font-family:Arial,Helvetica,sans-serif;font-size:12pt;letter-spacing:-.01em;overflow-x:hidden}
        a{color:inherit;text-decoration:none;font-family:Arial,Helvetica,sans-serif}
        a:hover{color:#000000}
        .site{min-height:100vh}
        .topbar{position:sticky;top:0;z-index:10;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:18px 22px;border-bottom:1px solid var(--line);background:rgba(208,182,215,.88);backdrop-filter:blur(12px);font-size:8pt;text-transform:uppercase;letter-spacing:.08em}
        .topbar .center{font-family:Arial,Helvetica,sans-serif;font-size:8pt;letter-spacing:.02em;text-transform:none}
        .topbar .right{justify-self:end;display:flex;gap:18px;flex-wrap:wrap}
        .hero{min-height:40vh;display:flex;align-items:end;padding:8vw 22px 34px;border-bottom:1px solid var(--line)}
        h1{margin:0;font-family:'Times New Roman',Times,serif;font-weight:400;font-size:72pt;line-height:1;letter-spacing:0;color:#000000;white-space:nowrap}
        .introText{max-width:720px;margin:26px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12pt;line-height:1.35;color:#000000!important;overflow-wrap:break-word}
        .section{border-bottom:1px solid var(--line)}
        .sectionHead{padding:22px;border-bottom:1px solid var(--line)}
        h2{margin:0;font-family:Arial,Helvetica,sans-serif;font-size:8pt;font-weight:400;line-height:1.1;letter-spacing:0;color:#000000}
        .list{display:grid;grid-template-columns:1fr}
        .listItem{display:grid;grid-template-columns:120px 1.2fr 1fr 160px;gap:20px;align-items:baseline;padding:22px;border-bottom:1px solid var(--line);background:transparent}
        .listItem:last-child{border-bottom:0}
        .listItem:hover{background:rgba(0,0,0,.06)}
        .type,.author,.status{font-size:8pt;line-height:1.35;text-transform:uppercase;letter-spacing:.06em;color:#000000!important}
        .title{font-family:Arial,Helvetica,sans-serif;font-size:14pt;line-height:1.15;letter-spacing:0;color:#000000!important;overflow-wrap:anywhere;word-break:normal}
        footer{display:flex;justify-content:space-between;gap:18px;padding:24px 22px 40px;font-size:8pt;text-transform:uppercase;letter-spacing:.08em;color:#000000}

        .site, .site *{color:#000000!important}
        @media(max-width:900px){
          .topbar{grid-template-columns:1fr;gap:10px}.topbar .right{justify-self:start}.topbar .center{grid-row:1}
          .hero{min-height:30vh;padding:34px 16px 28px}
          h1{font-size:clamp(40pt,18vw,72pt);white-space:normal;overflow-wrap:break-word}
          .introText{font-size:12pt;max-width:100%}
          .sectionHead,.playingNow,.listItem{padding-left:16px;padding-right:16px}
          .listItem{grid-template-columns:1fr;gap:8px}
          .title{font-size:14pt;max-width:100%;overflow-wrap:anywhere}
          .type,.author,.status{font-size:8pt}
          footer{display:block;padding-left:16px;padding-right:16px}footer div+div{margin-top:10px}
        }
      `}</style>
      <main className="site">
        <header className="hero">
          <div>
            <h1>Book Club</h1>
            <p className="introText">Helloooo, Farah here. This is a small, growing archive of books from my library, open to be read if you&apos;re in Kuala Lumpur. The list is still being filled in, but everything marked available is welcome to be borrowed.</p>
          </div>
        </header>

        <section className="section" id="playing-now">
          <div className="sectionHead"><h2>Playing Now</h2></div>
          <div className="list">
            <article className="listItem">
              <div className="type">Song</div>
              <a className="title" href="https://open.spotify.com/track/1zNXF2svmdlNxfS5XeNUgr?si=a40c6b9f5e83483c" target="_blank" rel="noopener noreferrer">Don&apos;t Know Why</a>
              <div className="author">Norah Jones</div>
              <div className="status">Playing now</div>
            </article>
          </div>
        </section>

        <section className="section" id="current">
          <div className="sectionHead"><h2>Current Reads</h2></div>
          <div className="list">
            <article className="listItem">
              <div className="type">Memoir</div>
              <div className="title">I Saw Ramallah</div>
              <div className="author">Mourid Barghouti</div>
              <div className="status">Current read</div>
            </article>
          </div>
        </section>

        <section className="section" id="lent">
          <div className="sectionHead"><h2>Lent Books</h2></div>
          <div className="list">
            <article className="listItem">
              <div className="type">Novel</div>
              <div className="title">The Vegetarian</div>
              <div className="author">Han Kang</div>
              <div className="status">Lent</div>
            </article>
            <article className="listItem">
              <div className="type">Essays</div>
              <div className="title">In the Garden: Essays on Nature and Growing</div>
              <div className="author">Daunt Books, ed.</div>
              <div className="status">Lent</div>
            </article>
            <article className="listItem">
              <div className="type">Novel</div>
              <div className="title">The Curious Incident of the Dog in the Night-Time</div>
              <div className="author">Mark Haddon</div>
              <div className="status">Lent</div>
            </article>
          </div>
        </section>

        <section className="section" id="available">
          <div className="sectionHead"><h2>Available</h2></div>
          <div className="list">
            {availableBooks.map(([type, title, author, status]) => (
              <article className="listItem" key={title}>
                <div className="type">{type}</div>
                <div className="title">{title}</div>
                <div className="author">{author}</div>
                <div className="status">{status}</div>
              </article>
            ))}
          </div>
        </section>

        <footer>
          <div>Book Club</div>
          <div><a href="https://farahainismail.substack.com" target="_blank" rel="noopener noreferrer">@farahainismail</a> · <a href="https://instagram.com/kingfrh" target="_blank" rel="noopener noreferrer">@kingfrh</a></div>
        </footer>
      </main>
    </>
  );
}
