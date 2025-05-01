
'use client';

import {useRouter} from 'next/navigation';
import {Button} from '@/components/ui/button'
import {useEffect, useState} from 'react'
import Image from 'next/image';

export default function StartScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(false)
  }, [router]);

  if (isLoading) {
    return <div className="flex flex-col items-center justify-center min-h-screen py-2">Loading...</div>
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Image
        src="https://cdn.glitch.global/baa5928e-6c09-4efd-bb8d-06e0fe6e4aac/BB.png?v=1729706784295"
        alt="BalanceBuddy Logo"
        width={200}
        height={200}
        className="mb-8"
      />
      <h1 className="text-4xl font-bold mb-8">Welcome to BalanceBuddy</h1>
      <p className="text-lg mb-4">Find your balance.</p>
      <div className="space-x-4">
        <Button onClick={() => router.push('/login')}>Login</Button>
        <Button variant="secondary" onClick={() => router.push('/onboarding/1')}>
          Sign Up
        </Button>
      </div>
    </div>
  );
}
