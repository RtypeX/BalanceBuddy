'use client';

import React, {useState} from 'react';
import {useRouter} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from "@/components/ui/label";
import {useToast} from "@/hooks/use-toast";

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const {toast} = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'test@test.com' && password === 'password') {
      localStorage.setItem('user', JSON.stringify({email: 'test@test.com'}));
      localStorage.setItem('setupComplete', 'true');
      toast({
        title: 'Login successful',
        description: 'You are now logged in.',
      });
      router.push('/home');
    } else {
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: 'Invalid credentials.',
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
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
