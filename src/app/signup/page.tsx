'use client';

import React, {useState} from 'react';
import {useRouter} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from "@/components/ui/label";
import {useToast} from "@/hooks/use-toast";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";

const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const {toast} = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Signup failed',
        description: 'Password must be at least 6 characters.',
      });
      return;
    }
    localStorage.setItem('user', JSON.stringify({email}));
    toast({
      title: 'Signup successful',
      description: 'You are now signed up. Taking you to onboarding...',
    });
    router.push('/onboarding/1'); // Redirect to the first onboarding page
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Avatar className="mb-8 h-24 w-24">
        <AvatarFallback>BB</AvatarFallback>
      </Avatar>
      <h1 className="text-3xl font-bold mb-8">Sign Up</h1>
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
        <Button type="submit">Sign Up</Button>
      </form>
      <p className="mt-4">
        Already have an account?
        <Button variant="link" onClick={() => router.push('/login')}>
          Login
        </Button>
      </p>
    </div>
  );
};

export default Signup;
