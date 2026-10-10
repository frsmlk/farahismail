import Link from 'next/link';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Farah Ismail', description: 'An archive and playground by Farah Ismail.', alternates: { canonical: '/' } };
export default function HomePage() {
  return <main className="worldLanding">
    <nav aria-label="Explore"><Link href="/about">About</Link><Link href="/bookindex">Book Index</Link><Link href="/play">Play</Link><Link className="worldMood" href="/mood">Mood</Link></nav>
    <footer><div><a href="https://instagram.com/kingfrh" target="_blank" rel="noopener noreferrer">Instagram</a><a href="https://substack.com/@bookindex" target="_blank" rel="noopener noreferrer">Substack</a></div><p>For architecture &amp; design enquiries, click <a href="https://aaakl.co">here.</a></p></footer>
    <style>{`
      .worldLanding {box-sizing:border-box;min-height:100svh;background:#100756;color:#cdc2ed;padding:clamp(28px,4.6vw,88px);font-family:Helvetica,Arial,sans-serif;display:flex;flex-direction:column;}
      .worldLanding nav {display:flex;flex-direction:column;align-items:flex-start;padding-top:clamp(40px,8vw,154px);}
      .worldLanding nav a {font-size:clamp(64px,8.3vw,160px);line-height:.86;letter-spacing:-.055em;font-weight:400;text-decoration:none;color:inherit;}
      .worldLanding nav .worldMood {color:#b20778;}
      .worldLanding a:hover {opacity:.75;} .worldLanding a:focus-visible {outline:2px solid currentColor;outline-offset:5px;}
      .worldLanding footer {margin-top:auto;padding-top:120px;padding-bottom:24px;font-size:clamp(18px,1.5vw,29px);line-height:1.15;letter-spacing:-.035em;}
      .worldLanding footer div {display:flex;flex-direction:column;align-items:flex-start;} .worldLanding footer a {color:inherit;text-decoration:none;} .worldLanding footer p {margin:44px 0 0;} .worldLanding footer p a {font-weight:700;}
      @media(max-width:600px){.worldLanding nav {padding-top:12vh;}.worldLanding nav a {font-size:clamp(54px,14vw,84px);}.worldLanding footer {padding-top:90px;font-size:17px;}.worldLanding footer p {max-width:330px;margin-top:30px;}}
    `}</style>
  </main>;
}
