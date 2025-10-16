import Link from 'next/link';
import { blog } from '@/utils/source';

export default function Page(): React.ReactElement {
  const posts = blog.getPages();

  const svg = `<svg viewBox='0 0 500 500' xmlns='http://www.w3.org/2000/svg'>
  <filter id='noiseFilter'>
    <feTurbulence 
      type='fractalNoise' 
      baseFrequency='0.65' 
      numOctaves='3' 
      stitchTiles='stitch'/>
  </filter>
  
  <rect width='100%' height='100%' filter='url(#noiseFilter)'/>
</svg>`;

  return (
    <main className="container max-sm:px-0 md:py-12">
      <div className="rounded-lg overflow-hidden">
        <div
          className="h-[300px] p-8 md:h-[400px] md:p-12"
          style={{
            backgroundImage: [
              `linear-gradient(to right, 
                rgba(0, 0, 0, 0.1),
                hsl(var(--background) / 0.9) 40%,
                hsl(var(--background)) 50%,
                hsl(var(--background) / 0.9) 60%,
                rgba(0, 0, 0, 0.1)
              ),
              radial-gradient(
                circle at center,
                hsl(var(--background)) 80%,
                rgba(0, 0, 0, 0.1) 100%
              )`,
              `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
            ].join(', ')
          }}
        >
          <h1 className="mb-4 border-b-4 border-foreground pb-2 text-4xl font-bold md:text-5xl">
            LTM Starter Kit Blog
          </h1>
          <p className="text-sm md:text-base">
            Design language and easability of use
          </p>
        </div>
        <div className="mt-2 grid grid-cols-1 border md:grid-cols-3 lg:grid-cols-4 rounded-b-lg">
          <p className="p-4 text-muted-foreground">No blog posts available yet.</p>
        </div>
      </div>
    </main>
  );
}
