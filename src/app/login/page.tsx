
'use client';

import React, {useState} from 'react';
import {useRouter} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from "@/components/ui/label";
import {useToast} from "@/hooks/use-toast";
import Image from 'next/image';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const {toast} = useToast();

  const handleDemoLogin = () => {
    localStorage.setItem('user', JSON.stringify({ id: 'demo', email: 'demo@example.com' }));
    toast({
      id: "demo-login",
      title: 'Demo Login Successful',
      description: 'Logged in as demo user.',
    });
    router.push('/home');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // For demo purposes, simply store a dummy user.
    // In a real app, you would authenticate against Firebase Auth.
    localStorage.setItem('user', JSON.stringify({ id: 'dummy', email: email }));
    toast({
      id: "login-success",
      title: 'Login successful',
      description: 'You are now logged in.',
    });
    router.push('/home');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Image
        src="https://cdn.glitch.global/baa5928e-6c09-4efd-bb8d-06e0fe6e4aac/BB.png?v=1729706784295"
        alt="BalanceBuddy Logo"
        width={150}
        height={150}
        className="mb-8 rounded-full" // Added rounded-full
      />
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
        <Button variant="link" onClick={() => router.push('/onboarding/1')}>
          Sign Up
        </Button>
      </p>
      <Button variant="secondary" onClick={handleDemoLogin}>
        Demo Login
      </Button>
    </div>
  );
};

export default Login;

