import Link from 'next/link';
export const metadata = {title:'Mood',alternates:{canonical:'/mood'}};
export default function MoodPage(){return <main style={{minHeight:'100svh',background:'#100756',color:'#cdc2ed',padding:'12vh 5vw',fontFamily:'Helvetica,Arial,sans-serif'}}><Link href="/" style={{color:'inherit'}}>← Home</Link><h1 style={{fontSize:'clamp(64px,8vw,160px)',fontWeight:400,letterSpacing:'-.055em',margin:'40px 0 20px'}}>Mood</h1><p style={{fontSize:24}}>Coming soon.</p></main>}
