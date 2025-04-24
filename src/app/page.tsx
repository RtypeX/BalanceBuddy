'use client';

import {useRouter} from 'next/navigation';
import {Button} from '@/components/ui/button'
import {useEffect, useState} from 'react'
import {Avatar, AvatarFallback} from '@/components/ui/avatar'
import {onAuthStateChanged} from 'firebase/auth'
import {auth, getFirebase} from '@/lib/firebaseClient'

export default function StartScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const firebase = getFirebase();
    if (firebase && auth) {
      onAuthStateChanged(auth, (user) => {
        if(user) {
          router.push('/home');
        }
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
      console.error("Firebase not initialized");
    }
  }, [router]);

  if (isLoading) {
    return <div className="flex flex-col items-center justify-center min-h-screen py-2">Loading...</div>
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Avatar className="mb-8 h-24 w-24">
        <AvatarFallback>BB</AvatarFallback>
      </Avatar>
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
