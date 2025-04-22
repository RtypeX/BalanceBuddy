'use client';

import React from 'react';
import {useRouter} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Progress} from "@/components/ui/progress";

interface OnboardingPageProps {
  params: {
    page: string;
  };
}

const OnboardingPage: React.FC<OnboardingPageProps> = ({params}) => {
  const {page} = params;
  const router = useRouter();
  const pageNumber = parseInt(page);

  const totalPages = 3; // Total number of onboarding pages
  const progress = (pageNumber / totalPages) * 100;

  const handleNext = () => {
    if (pageNumber < totalPages) {
      router.push(`/onboarding/${pageNumber + 1}`);
    } else {
      localStorage.setItem('setupComplete', 'true');
      router.push('/setup');
    }
  };

  const handleBack = () => {
    if (pageNumber > 1) {
      router.push(`/onboarding/${pageNumber - 1}`);
    } else {
      router.push('/signup');
    }
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
              <p>Discover personalized workout plans tailored to your fitness goals.</p>
              <p>Set your preferences and let our AI generate the perfect routine for you.</p>
            </div>
          )}
          {pageNumber === 2 && (
            <div>
              <p>Track your progress and stay motivated with detailed workout history.</p>
              <p>Analyze your performance and see how far you've come!</p>
            </div>
          )}
          {pageNumber === 3 && (
            <div>
              <p>Get instant workout advice from our AI-powered BalanceBot.</p>
              <p>Ask any question and receive helpful tips and guidance.</p>
            </div>
          )}
          <div className="flex justify-between">
            <Button variant="secondary" onClick={handleBack} disabled={pageNumber === 1}>
              Back
            </Button>
            <Button onClick={handleNext}>
              {pageNumber === totalPages ? 'Complete' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingPage;
