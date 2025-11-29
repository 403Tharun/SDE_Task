import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useRouter } from 'next/router';
import '../styles/globals.css';
import { queryClient as defaultClient } from '../lib/api';
import NavBar from '../components/NavBar';

function App({ Component, pageProps }) {
  const [client] = useState(() => defaultClient);
  const router = useRouter();
  const showNav = router.pathname !== '/';

  return (
    <QueryClientProvider client={client}>
      {showNav && <NavBar />}
      <Component {...pageProps} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;


