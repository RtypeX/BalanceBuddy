'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useRouter} from 'next/navigation';
import React, { useState, type FC } from 'react';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { Button } from '@/components/ui/button';
import { getFirebase } from "@/lib/firebaseClient";

const OnboardingSteps = ['signup', 'personal-info', 'profile'] as const;
type OnboardingStep = (typeof OnboardingSteps)[number];

interface OnboardingPageProps {
  params: {
    page: string;
  };
}

interface OnboardingStepProps {
  step: OnboardingStep;
  formData: Record<string, string | number>;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const OnboardingStepComponent: React.FC<OnboardingStepProps> = ({ step, formData, setFormData }) => {
  switch (step) {
    case 'signup':
      return <SignupForm formData={formData} setFormData={setFormData} />;

    case 'personal-info':
      return <PersonalInfoForm formData={formData} setFormData={setFormData} />;
    case 'profile':
      return <ProfileForm formData={formData} setFormData={setFormData} />;
    default: {
      return (
        <CardHeader>
          <CardTitle>Invalid Step</CardTitle>
        </CardHeader>
      )
    }
  }
};

const OnboardingPage: FC<OnboardingPageProps> = ({ params }) => {
  const page = params.page
  const router = useRouter();
  const pageNumber = parseInt(page);
  const currentStep = OnboardingSteps[pageNumber - 1];
  const { toast } = useToast();
  const firebase = getFirebase();

  const getStepTitle = () => {
    switch (currentStep) {
      case 'signup':
        return 'Create Your Account';
      case 'personal-info':
        return 'Personal Information';
      case 'profile':
        return 'Profile';
      default:
        return 'Onboarding';
    }
  };
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    age: '',
    height: '',
    weight: '',
  });

  const totalPages = OnboardingSteps.length;
  const progress = (pageNumber / totalPages) * 100;
  const handleNext = () => {
    if (pageNumber < totalPages) {
      router.push(`/onboarding/${pageNumber + 1}`);
    } else {
      completeSignUp();
    }
  };

  const handleBack = () => {
    if (pageNumber > 1) {
      router.push(`/onboarding/${pageNumber - 1}`);
    } else {
      router.push('/');
    }
  };

  const completeSignUp = async (): Promise<void> => {
    try {
      // Get Auth and Firestore instances

      const auth = getAuth();
      const db = getFirestore();


      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      if (!user) throw new Error("User not found after creation");

      // Create user document in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        name: formData.name,
        email: formData.email,
        age: parseInt(formData.age),
        height: parseInt(formData.height),
        weight: parseInt(formData.weight),
      });

      // Store user information in localStorage
      localStorage.setItem('user', JSON.stringify({ id: user.uid, email: formData.email }));
      localStorage.setItem('setupComplete', 'true');

      toast({id: "user-created",
        title: 'Signup successful',
        description: 'You are now signed up and your profile has been created.',
      });
      router.push('/');
    } catch (error: any) {
      let errorMessage = "An unknown error occurred.";
        if (error.code) {
            switch (error.code) {
                case "auth/email-already-in-use":
                    errorMessage = "The email address is already in use by another account.";
                    break;
                default:
                    errorMessage = error.message
            }
        }
      toast({
        id: "user-creation-failed",
        variant: 'destructive',
        title: 'Sign up failed',
        description: errorMessage,
      });
    }
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Card className="w-96">
        <CardHeader>
          <CardTitle>{getStepTitle()}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={progress} className='mb-4' />
          <OnboardingStepComponent step={currentStep} formData={formData} setFormData={setFormData} />          <div className='flex justify-between'>
            <Button variant="secondary" onClick={handleBack} disabled={pageNumber === 1}>
              Back
            </Button>
            {pageNumber < totalPages ? (
              <Button onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button onClick={completeSignUp}>
                Complete

              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface SignupFormProps {
  formData: Record<string, string | number>;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const SignupForm: React.FC<SignupFormProps> = ({ formData, setFormData }) => {
  return (
    <div className="space-y-4">

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="Your Email"
          required
          className="mt-1"
        />
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            id="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Your password"
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Your Name"
            required
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
};

interface PersonalInfoFormProps {
  formData: Record<string, string | number>;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ formData, setFormData }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="age">Age</Label>
        <Input
          type="number"
          id="age"
          value={formData.age}
          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
          placeholder="Your Age"
          required
          className="mt-1"
        />
      </div>
    </div>
  );
};

interface ProfileFormProps {
  formData: Record<string, string | number>;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ formData, setFormData }) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="height">Height (cm)</Label>
        <Input
          type="number"
          id="height"
          value={formData.height}
          onChange={(e) => setFormData({ ...formData, height: e.target.value })}
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
          value={formData.weight}
          onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
          placeholder="Your Weight (kg)"
          required
          className="mt-1"
        />
      </div>
    </div>
  );
};

export default OnboardingPage;
