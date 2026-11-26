import './globals.css';
import type { Metadata } from 'next';
export const metadata:Metadata={title:'GOLU — Websites that work for business',description:'Create, improve and manage your business website with AI.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
