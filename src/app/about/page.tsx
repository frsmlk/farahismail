import Link from 'next/link';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'About Farah Ismail', alternates: {canonical:'/about'} };
export default function AboutPage(){return <main className="worldAbout"><Link className="worldPageHome" href="/">← Home</Link><h1><Link href="/">About</Link></h1><div><p>Welcome to farahismail.com</p><p><Link href="/play">Play some games</Link>, <Link href="/bookindex">borrow some books</Link>, or explore Farah’s design footprint through <Link href="/maps">Maps</Link>.</p><p>Farah Ismail is an architectural designer based in Kuala Lumpur, working across urban spaces, architecture and interiors.</p></div><style>{`body{margin:0}*{box-sizing:border-box}.view[hidden]{display:none!important}
      .worldLanding {box-sizing:border-box;min-height:100svh;background:#100756;color:#cdc2ed;padding:clamp(28px,4.6vw,88px);font-family:Helvetica,Arial,sans-serif;display:flex;flex-direction:column;}
      .worldLanding nav {display:flex;flex-direction:column;align-items:flex-start;padding-top:clamp(40px,8vw,154px);}
      .worldLanding nav a {font-size:clamp(64px,8.3vw,160px);line-height:.86;letter-spacing:-.055em;font-weight:400;text-decoration:none;color:inherit;}
      .worldLanding nav .worldMood {color:#b20778;}
      .worldLanding a:hover {opacity:.75;} .worldLanding a:focus-visible {outline:2px solid currentColor;outline-offset:5px;}
      .worldLanding footer {margin-top:auto;padding-top:120px;padding-bottom:24px;font-size:clamp(18px,1.5vw,29px);line-height:1.15;letter-spacing:-.035em;}
      .worldLanding footer div {display:flex;flex-direction:column;align-items:flex-start;} .worldLanding footer a {color:inherit;text-decoration:none;} .worldLanding footer p {margin:44px 0 0;} .worldLanding footer p a {font-weight:700;}
      @media(max-width:600px){.worldLanding nav {padding-top:12vh;}.worldLanding nav a {font-size:clamp(54px,14vw,84px);}.worldLanding footer {padding-top:90px;font-size:17px;}.worldLanding footer p {max-width:330px;margin-top:30px;}}
    

.worldAbout {box-sizing:border-box;min-height:100svh;background:#3f3857;color:#c9bfd0;padding:clamp(28px,4.6vw,88px);padding-top:clamp(100px,13.3vw,252px);display:grid;grid-template-columns:33% 1fr;gap:2%;align-content:start;font-family:Helvetica,Arial,sans-serif;}
.worldAbout h1 {font-size:clamp(64px,8.3vw,160px);font-weight:400;line-height:.86;letter-spacing:-.055em;margin:0;} .worldAbout h1 a{color:inherit;text-decoration:none;} .worldAbout p{font-size:clamp(18px,1.5vw,29px);line-height:1.05;letter-spacing:-.035em;margin:0 0 30px;max-width:840px;} .worldAbout a:focus-visible{outline:2px solid currentColor;outline-offset:5px;}
@media(max-width:600px){.worldAbout{display:block;padding-top:12vh;}.worldAbout h1{margin-bottom:44px;}.worldAbout p{font-size:20px;line-height:1.15;}}
 .previewPage{min-height:100svh;background:#100756;color:#cdc2ed;padding:12vh 5vw;font-family:Helvetica,Arial,sans-serif}.previewPage a{color:inherit}.previewPage h1{font-size:clamp(64px,8vw,160px);font-weight:400;letter-spacing:-.055em;margin:40px 0 20px}.previewPage p{font-size:24px}.previewFrame{display:block;border:0;width:100%;height:80vh}.frameHeader{padding:15px 5vw;background:#100756;color:#cdc2ed;font-family:Arial}.frameHeader a{color:inherit}
/* Shared Book Index palette and typography. */
body {background:#f7f5ef;color:#000;}
.worldLanding,.worldAbout,.previewPage,.frameHeader {background:#f7f5ef;color:#000;font-family:Helvetica,"Helvetica Neue",Arial,sans-serif;}
.worldLanding *, .worldAbout *, .previewPage *, .frameHeader * {font-family:Helvetica,"Helvetica Neue",Arial,sans-serif;}
.worldLanding nav a,.worldLanding nav .worldMood,.worldAbout h1,.previewPage h1 {color:#2b1c45;font-weight:700;font-size:clamp(55.44px,10.56vw,126.72px);line-height:.85;letter-spacing:-.05em;}
.worldLanding footer,.worldAbout p,.previewPage p,.frameHeader {font-size:18.24px;line-height:1.15;letter-spacing:0;}
.worldLanding footer,.worldLanding footer a,.frameHeader a,.previewPage>a {color:#2b1c45;}
.worldAbout p {font-weight:400;}
.worldLanding footer p a {font-weight:700;}
@media(max-width:600px){.worldLanding nav a,.worldAbout h1,.previewPage h1 {font-size:clamp(55.44px,10.56vw,126.72px);}.worldAbout p,.worldLanding footer {font-size:18.24px;line-height:1.15;}}

.worldLanding {background:#2b1c45;color:#f7f5ef;}
.worldLanding nav a,.worldLanding nav .worldMood,.worldLanding footer,.worldLanding footer a {color:#f7f5ef;}
.worldLanding footer p,.worldLanding footer p a {font-family:Helvetica,"Helvetica Neue",Arial,sans-serif;font-size:18.24px;line-height:1.15;letter-spacing:0;}

.worldLanding {background:#2b1c45;color:#f7f5ef;}
.worldLanding,.worldLanding * {font-weight:400!important;}
.worldLanding nav a,.worldLanding nav .worldMood,.worldLanding footer,.worldLanding footer a {color:#f7f5ef;}

#bookindex {height:100svh;position:relative;}
#bookindex > .frameHeader {position:absolute;top:0;left:0;z-index:10;background:transparent;padding:10px 5vw;}
#bookindex > .previewFrame {height:100svh;}

#play {min-height:100svh;background:#2b1c45;}
#play > .frameHeader {background:#2b1c45;color:#f7f5ef;padding:10px 5vw;}
#play > .frameHeader a {color:#f7f5ef;}
#play > .previewFrame {height:calc(100svh - 41px);background:#2b1c45;}
#maps .previewPage {min-height:100svh;padding:clamp(28px,4.6vw,88px);padding-top:clamp(100px,13.3vw,252px);}
#maps .previewPage h1 {margin-top:40px;}
@media(max-width:600px){#maps .previewPage{padding-top:12vh;}}

.worldAbout p a {color:inherit;text-underline-offset:3px;font-weight:400;}

.worldAbout {display:block;}
.worldAbout h1 {margin-bottom:48px;}
.worldAbout > div {width:100%;max-width:none;}
.worldAbout p {font-size:72.96px;line-height:1.15;max-width:none;overflow-wrap:anywhere;margin-bottom:48px;}
.worldAbout a {text-decoration:none;}
@media(max-width:600px){.worldAbout p {font-size:72.96px;}.worldAbout h1 {margin-bottom:40px;}}

.worldAbout {background:#291d43;color:#f7f5ef;}
.worldAbout h1,.worldAbout h1 a,.worldAbout p,.worldAbout p a {color:#f7f5ef;}
.worldAbout p,.worldAbout p a {font-family:Helvetica,"Helvetica Neue",Arial,sans-serif;font-weight:400;font-size:36px;line-height:1.15;letter-spacing:0;text-decoration:none;}
@media(max-width:600px){.worldAbout p,.worldAbout p a {font-size:36px;}}

.bcHero h1,.worldAbout h1,.previewPage h1,.playTop h1 {font-family:Helvetica,"Helvetica Neue",Arial,sans-serif!important;font-size:clamp(55.44px,10.56vw,126.72px)!important;font-weight:700!important;line-height:.85!important;letter-spacing:-.05em!important;transform:none!important;}
.worldBookHome,.worldPlayHome,.worldPageHome {position:absolute!important;top:10px!important;left:5vw!important;z-index:10;padding:0!important;margin:0!important;font:400 18.24px/1.15 Helvetica,"Helvetica Neue",Arial,sans-serif!important;text-decoration:none!important;}
.worldPlayHome a {font:inherit!important;text-decoration:none!important;}
.worldAbout,.playSite,#maps,.bcSite {position:relative;}
.worldPageHome {color:inherit;}
.playSite {padding-top:41px;}
`}</style></main>}
