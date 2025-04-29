'use client';

import React, {useState} from 'react';
import {useRouter} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from "@/components/ui/label";
import {useToast} from "@/hooks/use-toast";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const {toast} = useToast();

  const handleDemoLogin = () => {
    // Set a demo user in localStorage
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

    // Add your actual authentication logic here (e.g., Firebase, Supabase)

    // For now, let's just set a dummy user in localStorage and redirect
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
