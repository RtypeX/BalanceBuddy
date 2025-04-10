'use client';

import {useRouter} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {useEffect} from "react";

export default function StartScreen() {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('user');
    const setupComplete = localStorage.getItem('setupComplete');
    if (user) {
      if (setupComplete) {
        router.push('/home');
      } else {
        router.push('/setup');
      }
    }
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-8">Welcome to FitNext</h1>
      <p className="text-lg mb-4">Get fit and track your progress.</p>
      <div className="space-x-4">
        <Button onClick={() => router.push('/login')}>Login</Button>
        <Button variant="secondary" onClick={() => router.push('/signup')}>
          Sign Up
        </Button>
      </div>
    </div>
  );
}
