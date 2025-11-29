import { useEffect } from 'react';
import { useRouter } from 'next/router';
import LoginPage from './index';

export default function LoginRoute() {
  const router = useRouter();
  
  // This route just redirects to the main login page at /
  useEffect(() => {
    router.replace('/');
  }, [router]);

  return null;
}

