import ClientProvider from '@/components/providers/ClientProvider';
import MainContent from '@/components/MainContent';

export default function Home() {
  return (
    <ClientProvider>
      <MainContent />
    </ClientProvider>
  );
}
