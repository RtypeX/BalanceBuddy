'use client';

import React from 'react';
import {useRouter} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Progress} from "@/components/ui/progress";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {useState} from "react";

interface OnboardingPageProps {
  params: {
    page: string;
  };
}

const OnboardingPage: React.FC<OnboardingPageProps> = ({params}) => {
  const {page} = params;
  const router = useRouter();
  const pageNumber = parseInt(page);

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const totalPages = 5; // Total number of onboarding pages
  const progress = (pageNumber / totalPages) * 100;

  const handleNext = () => {
    if (pageNumber < totalPages) {
      router.push(`/onboarding/${pageNumber + 1}`);
    } else {
      localStorage.setItem('setupComplete', 'true');
      router.push('/home');
    }
  };

  const handleBack = () => {
    if (pageNumber > 1) {
      router.push(`/onboarding/${pageNumber - 1}`);
    } else {
      router.push('/signup');
    }
  };

  const handleSubmit = () => {
    localStorage.setItem('name', name);
    localStorage.setItem('age', age);
    localStorage.setItem('height', height);
    localStorage.setItem('weight', weight);
    localStorage.setItem('email', email);
    localStorage.setItem('password', password);
    handleNext();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Card className="w-96">
        <CardHeader>
          <CardTitle>Welcome to BalanceBuddy - Onboarding ({pageNumber}/{totalPages})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={progress}/>

          {pageNumber === 1 && (
            <div>
              <p>Let's start with your basic information:</p>
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  required
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {pageNumber === 2 && (
            <div>
              <p>Tell us more about yourself:</p>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  type="number"
                  id="age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Your Age"
                  required
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {pageNumber === 3 && (
            <div>
              <p>Almost there! Enter your physical attributes:</p>
              <div>
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  type="number"
                  id="height"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="Your Height (cm)"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  type="number"
                  id="weight"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Your Weight (kg)"
                  required
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {pageNumber === 4 && (
            <div>
              <p>Lastly, your account details:</p>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your Email"
                  required
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {pageNumber === 5 && (
            <div>
              <p>Create a secure password:</p>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your Password"
                  required
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="secondary" onClick={handleBack} disabled={pageNumber === 1}>
              Back
            </Button>
            {pageNumber < totalPages ? (
              <Button onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit}>
                Complete
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingPage;
