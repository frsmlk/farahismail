import Link from 'next/link';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'About Farah Ismail', alternates: {canonical:'/about'} };
export default function AboutPage(){return <main className="worldAbout"><h1><Link href="/">About</Link></h1><div><p>Farah Ismail is an architectural designer based in Kuala Lumpur, working across urban spaces, architecture and interiors.</p><p>This website is her little world online: part archive, part playground. A growing collection of books, ideas, moods and occasional games, it makes room for exchanges, experiments and whatever catches her attention. A shop will join the mix in time.</p></div><style>{`
.worldAbout {box-sizing:border-box;min-height:100svh;background:#100756;color:#cdc2ed;padding:clamp(28px,4.6vw,88px);padding-top:clamp(100px,13.3vw,252px);display:grid;grid-template-columns:33% 1fr;gap:2%;align-content:start;font-family:Helvetica,Arial,sans-serif;}
.worldAbout h1 {font-size:clamp(64px,8.3vw,160px);font-weight:400;line-height:.86;letter-spacing:-.055em;margin:0;} .worldAbout h1 a{color:inherit;text-decoration:none;} .worldAbout p{font-size:clamp(18px,1.5vw,29px);line-height:1.05;letter-spacing:-.035em;margin:0 0 30px;max-width:840px;} .worldAbout a:focus-visible{outline:2px solid currentColor;outline-offset:5px;}
@media(max-width:600px){.worldAbout{display:block;padding-top:12vh;}.worldAbout h1{margin-bottom:44px;}.worldAbout p{font-size:20px;line-height:1.15;}}
`}</style></main>}
