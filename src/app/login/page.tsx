'use client';

import React, {useState} from 'react';
import {useRouter} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from "@/components/ui/label";
import {useToast} from "@/hooks/use-toast";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import { account } from "@/lib/appwriteClient";


const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const {toast} = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 1. Login using Appwrite
      const session = await account.createEmailSession(email, password);

      if (!session) {
        toast({
          variant: 'destructive',
          title: 'Login failed',
          description: 'Invalid credentials.',
        });
        return;
      }

      // 2. Store user information in localStorage
      localStorage.setItem('user', JSON.stringify({ id: session.userId, email: email }));
      localStorage.setItem('setupComplete', 'true'); // Assuming setup is complete on login

      toast({
        title: 'Login successful',
        description: 'You are now logged in.',
      });
      router.push('/home');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: error.message,
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Avatar className="mb-8 h-24 w-24">
        <AvatarFallback>BB</AvatarFallback>
      </Avatar>
      <h1 className="text-3xl font-bold mb-8">Login</h1>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4 w-80">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="mt-1"
          />
        </div>
        <Button type="submit">Login</Button>
      </form>
      <p className="mt-4">
        Don't have an account?
        <Button variant="link" onClick={() => router.push('/signup')}>
          Sign Up
        </Button>
      </p>
    </div>
  );
};

export default Login;
