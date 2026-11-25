import type { Metadata } from 'next';
import './styles.css';

export const metadata: Metadata = { title: 'BD Everyday' };

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="bn"><body>{children}</body></html>;
}
