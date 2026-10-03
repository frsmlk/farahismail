'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import * as THREE from 'three';

export type TableBook = { title: string; author: string; status: string; cover: string | null; href: string };
const filters = ['All books', 'Available', 'Lent', 'Currently reading'];

export default function CoffeeTable({ books }: { books: TableBook[] }) {
  const mount = useRef<HTMLDivElement>(null);
  const hover = useRef(-1);
  const [filter, setFilter] = useState('All books');
  const [compact, setCompact] = useState(false);
  const [ready, setReady] = useState(false);
  const visible = useMemo(() => books.filter(b => filter === 'All books' || (filter === 'Lent' ? b.status.startsWith('Lent') : filter === 'Currently reading' ? b.status === 'Current read' : b.status === 'Available')), [books, filter]);
  const columns = compact ? 2 : 4;
  const width = compact ? 6.8 : 12;
  const rows = Math.ceil(visible.length / columns);
  const depth = Math.max(12, 5.7 + rows * 3.4);
  const layout = visible.map((book, i) => ({ book, x: ((i % columns) - (columns - 1) / 2) * (compact ? 2.8 : 2.55), z: -depth / 2 + 6 + Math.floor(i / columns) * 3.4, angle: [-0.07, 0.055, -0.025, 0.08, 0.015][i % 5], w: 1.9 + (i % 3) * 0.1, d: 2.65 + (i % 2) * 0.15 }));

  useEffect(() => {
    const media = window.matchMedia('(max-width: 640px)');
    const resize = () => setCompact(media.matches);
    resize(); media.addEventListener('change', resize);
    return () => media.removeEventListener('change', resize);
  }, []);

  useEffect(() => {
    const host = mount.current;
    if (!host) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false }); } catch { return; }
    let disposed = false;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    host.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#e6e1d7');
    const camera = new THREE.OrthographicCamera(-width / 2, width / 2, depth / 2, -depth / 2, 0.1, 100);
    camera.position.set(0, 35, 0); camera.up.set(0, 0, -1); camera.lookAt(0, 0, 0);
    scene.add(new THREE.HemisphereLight('#fff9ee', '#b6a68f', 2.4));
    const sun = new THREE.DirectionalLight('#fff4df', 3.2);
    sun.position.set(-9, 16, -8); sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -15, right: 15, top: depth / 2 + 5, bottom: -depth / 2 - 5, near: 0.1, far: 70 });
    sun.shadow.normalBias = 0.035; sun.shadow.bias = -0.0003;
    scene.add(sun);
    const standard = (color: string) => new THREE.MeshStandardMaterial({ color, roughness: 0.85 });
    const add = (geo: THREE.BufferGeometry, mat: THREE.Material | THREE.Material[], x: number, y: number, z: number) => {
      const mesh = new THREE.Mesh(geo, mat); mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; scene.add(mesh); return mesh;
    };
    // A procedural limestone surface: fine grain and irregular, faint mineral veins.
    const stoneCanvas = document.createElement('canvas'); stoneCanvas.width = 1024; stoneCanvas.height = 1024;
    const ctx = stoneCanvas.getContext('2d')!;
    ctx.fillStyle = '#e8e0cf'; ctx.fillRect(0, 0, 1024, 1024);
    let seed = 19;
    const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let i = 0; i < 24000; i++) { ctx.fillStyle = `rgba(125,106,83,${random() * 0.055})`; ctx.fillRect(random() * 1024, random() * 1024, 1.5, 1.5); }
    for (let i = 0; i < 45; i++) { ctx.beginPath(); let x = random() * 1024, z = random() * 1024; ctx.moveTo(x, z); for (let n = 0; n < 9; n++) { x += random() * 55 - 15; z += random() * 80 - 40; ctx.lineTo(x, z); } ctx.strokeStyle = 'rgba(140,124,101,0.07)'; ctx.lineWidth = random() * 1.5; ctx.stroke(); }
    const stone = new THREE.CanvasTexture(stoneCanvas); stone.colorSpace = THREE.SRGBColorSpace; stone.wrapS = stone.wrapT = THREE.RepeatWrapping; stone.repeat.set(2, depth / 6);
    add(new THREE.BoxGeometry(width - 0.65, 0.28, depth - 0.65), new THREE.MeshStandardMaterial({ map: stone, roughness: 0.9 }), 0, -0.14, 0);
    const bookMeshes: THREE.Mesh[] = [];
    const textures: THREE.Texture[] = [stone];
    const loader = new THREE.TextureLoader();
    layout.forEach((item, i) => {
      const edge = standard('#eee8dc');
      // Underlying volumes make small, informal stacks while every listed cover stays exposed.
      if (i % 3 === 0) { const base = add(new THREE.BoxGeometry(item.w + 0.14, 0.12, item.d + 0.12), [edge, edge, standard(['#5f554a', '#aaa193', '#b4a3a0'][i % 3]), edge, edge, edge], item.x + 0.09, 0.06, item.z + 0.06); base.rotation.y = item.angle - 0.035; }
      const top = standard('#f5f0e5');
      const mesh = add(new THREE.BoxGeometry(item.w, 0.15, item.d), [edge, edge, top, edge, edge, edge], item.x, i % 3 === 0 ? 0.205 : 0.085, item.z);
      mesh.rotation.y = item.angle; mesh.userData.baseY = mesh.position.y; bookMeshes.push(mesh);
      if (item.book.cover) loader.load(item.book.cover, texture => { if (disposed) { texture.dispose(); return; } texture.colorSpace = THREE.SRGBColorSpace;
        // Trim the white product-photo margin in the displayed texture, retaining the real artwork.
        const photo = texture.image as HTMLImageElement;
        const probe = document.createElement('canvas'); probe.width = photo.width; probe.height = photo.height;
        const probeContext = probe.getContext('2d')!; probeContext.drawImage(photo, 0, 0);
        const pixels = probeContext.getImageData(0, 0, probe.width, probe.height).data;
        let left = probe.width, right = 0, upper = probe.height, lower = 0;
        for (let y = 0; y < probe.height; y += 3) for (let x = 0; x < probe.width; x += 3) { const j = (y * probe.width + x) * 4; if (Math.min(pixels[j], pixels[j + 1], pixels[j + 2]) < 235) { left = Math.min(left, x); right = Math.max(right, x); upper = Math.min(upper, y); lower = Math.max(lower, y); } }
        if (right > left && lower > upper && (right - left) / probe.width > 0.3) { texture.repeat.set((right - left + 3) / probe.width, (lower - upper + 3) / probe.height); texture.offset.set(left / probe.width, 1 - (lower + 3) / probe.height); }
        texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); top.map = texture; top.color.set('#ffffff'); top.needsUpdate = true; textures.push(texture); });
      for (let line = 0; line < 5; line++) { const pages = add(new THREE.BoxGeometry(item.w - 0.03, 0.006, item.d - 0.02), standard('#d6d0c4'), item.x, mesh.position.y - 0.05 + line * 0.017, item.z); pages.rotation.y = item.angle; }
    });
    const frontZ = -depth / 2 + 2.75;
    // Glass vase, water, stems and red tulips viewed from above.
    const vase = add(new THREE.CylinderGeometry(0.57, 0.72, 1.05, 48, 1, true), new THREE.MeshPhysicalMaterial({ color: '#d8ece4', transparent: true, opacity: 0.25, roughness: 0.1, metalness: 0.15, side: THREE.DoubleSide }), -0.85, 0.53, frontZ);
    vase.castShadow = false;
    const rim = add(new THREE.TorusGeometry(0.57, 0.035, 12, 64), new THREE.MeshStandardMaterial({ color: '#d1e0d8', roughness: 0.15, transparent: true, opacity: 0.65 }), -0.85, 1.05, frontZ); rim.rotation.x = Math.PI / 2;
    add(new THREE.CylinderGeometry(0.65, 0.65, 0.035, 48), new THREE.MeshPhysicalMaterial({ color: '#b4d0bf', transparent: true, opacity: 0.3, roughness: 0.1 }), -0.85, 0.46, frontZ);
    const flowers = [[-2.05, 1.95, frontZ - 0.8], [-0.3, 2.45, frontZ - 1.25], [0.25, 1.85, frontZ + 0.35], [-1.8, 1.65, frontZ + 0.85]];
    flowers.forEach(([x, y, z], i) => {
      const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.85, 0.2, frontZ), new THREE.Vector3(-0.8 + (x + 0.85) * 0.45, 1.05, frontZ + (z - frontZ) * 0.45), new THREE.Vector3(x, y, z)]);
      add(new THREE.TubeGeometry(curve, 16, 0.03, 7, false), standard('#537442'), 0, 0, 0);
      const leaf = add(new THREE.SphereGeometry(0.24, 12, 10), standard('#507447'), (x - 0.85) / 2, 1.1, (z + frontZ) / 2); leaf.scale.set(0.35, 0.18, 1.8); leaf.rotation.y = i;
      add(new THREE.SphereGeometry(0.12, 12, 10), standard('#573623'), x, y - 0.03, z);
      for (let p = 0; p < 6; p++) { const a = p * Math.PI / 3; const petal = add(new THREE.SphereGeometry(0.21, 16, 12), standard(p % 2 ? '#b82d22' : '#db3e2c'), x + Math.cos(a) * 0.15, y, z + Math.sin(a) * 0.15); petal.scale.set(0.6, 1.4, 0.85); petal.rotation.y = -a; petal.rotation.z = Math.cos(a) * 0.3; }
    });
    // Coffee and collected stones, kept clear of book covers.
    const cupX = compact ? 1.8 : 2.3;
    add(new THREE.CylinderGeometry(0.43, 0.39, 0.65, 40), standard('#343831'), cupX, 0.33, frontZ + 0.35);
    add(new THREE.CylinderGeometry(0.37, 0.37, 0.01, 40), standard('#191713'), cupX, 0.665, frontZ + 0.35);
    const handle = add(new THREE.TorusGeometry(0.24, 0.065, 10, 24), standard('#343831'), cupX + 0.44, 0.34, frontZ + 0.35); handle.rotation.y = Math.PI / 2;
    const pebble = add(new THREE.SphereGeometry(0.28, 20, 16), standard('#aaa99a'), compact ? 1.6 : 4.05, 0.18, frontZ - 1.45); pebble.scale.set(1.5, 0.55, 1.1);
    const resize = () => renderer.setSize(host.clientWidth, host.clientHeight, false);
    const observer = new ResizeObserver(resize); observer.observe(host); resize();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0; let onScreen = true;
    const viewObserver = new IntersectionObserver(entries => { onScreen = entries[0].isIntersecting; }); viewObserver.observe(host);
    const render = () => { bookMeshes.forEach((mesh, i) => { const target = mesh.userData.baseY + (hover.current === i ? 0.24 : 0); mesh.position.y = reduced ? target : THREE.MathUtils.lerp(mesh.position.y, target, 0.16); }); if (onScreen && document.visibilityState === 'visible') renderer.render(scene, camera); raf = requestAnimationFrame(render); };
    render(); setReady(true);
    return () => { disposed = true; cancelAnimationFrame(raf); observer.disconnect(); viewObserver.disconnect(); scene.traverse(obj => { if (obj instanceof THREE.Mesh) { obj.geometry.dispose(); const materials = Array.isArray(obj.material) ? obj.material : [obj.material]; materials.forEach(m => m.dispose()); } }); textures.forEach(t => t.dispose()); renderer.dispose(); renderer.domElement.remove(); };
    // Layout is determined entirely by these values; hovering does not rebuild the scene.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, compact, width, depth]);

  return <section className="coffeeLibrary" aria-label="Interactive coffee table library">
    <div className="coffeeToolbar"><div className="coffeeFilters" aria-label="Filter books">{filters.map(f => <button key={f} aria-pressed={filter === f} onClick={() => { hover.current = -1; setFilter(f); }}>{f}</button>)}</div><Link href="?playlist=fun-pop#playlist-card" className="coffeePlaylist">♫ Fun Pop</Link></div>
    <p className="coffeeHint">A table of books. Select a cover to read more or borrow.</p>
    <div className={`coffeeScene ${ready ? 'isReady' : ''}`} style={{ aspectRatio: `${width} / ${depth}` }}>
      <div className="coffeeCanvas" ref={mount} />
      <div className="coffeeHitLayer">{layout.map(({ book, x, z, w, d, angle }, i) => <Link key={book.title} href={book.href} className="coffeeBookHit" aria-label={`${book.title} by ${book.author}. ${book.status}`} style={{ left: `${(x + width / 2 - w / 2) / width * 100}%`, top: `${(z + depth / 2 - d / 2) / depth * 100}%`, width: `${w / width * 100}%`, height: `${d / depth * 100}%`, transform: `rotate(${angle * -180 / Math.PI}deg)` }} onMouseEnter={() => { hover.current = i; }} onMouseLeave={() => { hover.current = -1; }} onFocus={() => { hover.current = i; }} onBlur={() => { hover.current = -1; }}>
        {!ready && book.cover ? <img src={book.cover} alt="" /> : null}
        {!book.cover ? <span className="coffeeMissing">{book.title}<small>{book.author}</small><small>Cover to be added</small></span> : null}
        <span className="coffeeBookLabel"><strong>{book.title}</strong><small>{book.status}</small></span>
      </Link>)}</div>
    </div>
    <details className="coffeeTextIndex"><summary>Browse the text index · {visible.length} books</summary><ul>{visible.map(b => <li key={b.title}><Link href={b.href}>{b.title}</Link><span>{b.author} · {b.status}</span></li>)}</ul></details>
    <style>{`
      .coffeeLibrary { position: relative; z-index: 2; margin: 0 auto 60px; max-width: 1200px; padding: 0 4vw; color: #27251f; }
      .coffeeToolbar { display:flex; justify-content:space-between; align-items:center; gap:20px; flex-wrap:wrap; margin-bottom:16px; font:12px Arial,sans-serif; }
      .coffeeFilters { display:flex; gap:18px; flex-wrap:wrap; }
      .coffeeFilters button { border:0; padding:4px 0; background:none; font:inherit; color:#777064; cursor:pointer; }
      .coffeeFilters button[aria-pressed=true] { color:#25221b; text-decoration:underline; text-underline-offset:5px; }
      .coffeePlaylist { font:12px Arial,sans-serif; color:inherit; }
      .coffeeHint { font:12px Arial,sans-serif; color:#81796c; margin:0 0 28px; }
      .coffeeScene { position:relative; width:100%; background:#e8e1d4; box-shadow:0 18px 50px #6e635321; border-radius:5px; overflow:visible; }
      .coffeeCanvas,.coffeeHitLayer { position:absolute; inset:0; }
      .coffeeCanvas { overflow:hidden; border-radius:5px; }
      .coffeeCanvas canvas { display:block; width:100%; height:100%; }
      .coffeeBookHit { position:absolute; display:block; cursor:pointer; outline:none; }
      .coffeeBookHit:focus-visible { outline:2px solid #514c3b; outline-offset:5px; }
      .coffeeBookHit img { width:100%; height:100%; object-fit:fill; box-shadow:3px 6px 12px #0003; }
      .coffeeBookLabel { position:absolute; left:50%; bottom:0; transform:translate(-50%,110%); opacity:0; pointer-events:none; background:#faf8f0; color:#29251f; padding:10px 12px; box-shadow:0 4px 16px #0002; font:12px Arial,sans-serif; min-width:180px; max-width:250px; z-index:5; }
      .coffeeBookLabel small { display:block; margin-top:4px; color:#7c7366; }
      .coffeeBookHit:hover,.coffeeBookHit:focus-visible { z-index:10; }
      .coffeeBookHit:hover .coffeeBookLabel,.coffeeBookHit:focus-visible .coffeeBookLabel { opacity:1; }
      .coffeeMissing { display:flex; flex-direction:column; justify-content:center; gap:12px; height:100%; padding:12%; font:14px Georgia,serif; background:#f3eee2; box-sizing:border-box; color:#403d34; }
      .coffeeMissing small { font:10px Arial,sans-serif; }
      .coffeeTextIndex { margin-top:30px; font:12px Arial,sans-serif; }
      .coffeeTextIndex summary { cursor:pointer; color:#6b6458; }
      .coffeeTextIndex ul { padding:16px 0; list-style:none; display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:18px 30px; }
      .coffeeTextIndex a { font-weight:bold; color:inherit; }.coffeeTextIndex span { display:block; margin-top:4px; color:#81796c; }
      @media(max-width:640px) { .coffeeLibrary { padding:0 4vw; }.coffeeToolbar { gap:16px; }.coffeeFilters { gap:14px; }.coffeeHint { margin-bottom:18px; }.coffeeTextIndex ul { grid-template-columns:1fr; }.coffeeMissing { font-size:11px; } }
    `}</style>
  </section>;
}
