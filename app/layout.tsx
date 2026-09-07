import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'9TO5 — Battle Cards',description:'Clock in. Throw down. A corporate fantasy arcade game.'};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="en"><body>{children}</body></html>}
