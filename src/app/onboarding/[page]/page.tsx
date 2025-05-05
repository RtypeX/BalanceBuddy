'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState, type FC, useEffect } from 'react';
// import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"; // Firebase Auth removed for demo
// import { getFirestore, doc, setDoc } from "firebase/firestore";       // Firestore removed for demo
import { Button } from '@/components/ui/button';
// import { getFirebase } from "@/lib/firebaseClient"; // Firebase client removed for demo

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
  const router = useRouter();
  // Use a state variable for the page number, initialized from local storage or params
  const [currentPageNumber, setCurrentPageNumber] = useState<number>(() => {
      const storedPage = localStorage.getItem('onboardingPage');
      const paramPage = parseInt(params.page);
      if (storedPage) {
          const storedNum = parseInt(storedPage);
          // If URL doesn't match stored, trust URL and update storage
          if (storedNum !== paramPage) {
              localStorage.setItem('onboardingPage', params.page);
              return paramPage;
          }
          return storedNum;
      }
      // If no stored page, use param and save it
      localStorage.setItem('onboardingPage', params.page);
      return paramPage;
  });

  useEffect(() => {
      // Ensure state updates if params change unexpectedly (e.g., manual URL change)
      const paramPageNum = parseInt(params.page);
      if (currentPageNumber !== paramPageNum) {
          setCurrentPageNumber(paramPageNum);
          localStorage.setItem('onboardingPage', params.page);
      }
  }, [params.page, currentPageNumber]);


  const currentStep = OnboardingSteps[currentPageNumber - 1];
  const { toast } = useToast();
  // const firebase = getFirebase(); // Firebase removed

  useEffect(() => {
    // Keep simple login check or remove if not needed for demo
    const userLoggedIn = localStorage.getItem('user'); // Check if user *started* signup/login
    if (!userLoggedIn && currentPageNumber > 1) { // Allow access to page 1 (signup) even if not "logged in"
      router.push('/'); // Redirect to start if trying to access later steps without starting
    }
     // Redirect to correct onboarding step if URL mismatches state/localStorage
     const targetPath = `/onboarding/${currentPageNumber}`;
     if (window.location.pathname !== targetPath) {
       // Use replace to avoid adding incorrect history entries
       router.replace(targetPath);
     }
  }, [router, currentPageNumber]);

  const getStepTitle = () => {
    switch (currentStep) {
      case 'signup':
        return 'Create Your Account';
      case 'personal-info':
        return 'Personal Information';
      case 'profile':
        return 'Finish Profile'; // Updated title
      default:
        return 'Onboarding';
    }
  };
  // Updated formData state to match new ProfileData structure
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    age: '',
    heightFt: '', // Height in feet
    heightIn: '', // Height in inches
    weightLbs: '', // Weight in pounds
  });

  const totalPages = OnboardingSteps.length;
  const progress = (currentPageNumber / totalPages) * 100;

  const handleNext = () => {
    if (currentPageNumber < totalPages) {
      const nextPage = currentPageNumber + 1;
      localStorage.setItem('onboardingPage', String(nextPage));
      setCurrentPageNumber(nextPage); // Update state
      router.push(`/onboarding/${nextPage}`); // Navigate
    } else {
      completeSignUp();
    }
  };

  const handleBack = () => {
    if (currentPageNumber > 1) {
      const prevPage = currentPageNumber - 1;
      localStorage.setItem('onboardingPage', String(prevPage));
      setCurrentPageNumber(prevPage); // Update state
      router.push(`/onboarding/${prevPage}`); // Navigate
    } else {
      localStorage.removeItem('onboardingPage'); // Clear page when going back to start
      localStorage.removeItem('user'); // Clear user marker if going back from step 1
      router.push('/');
    }
  };

  const completeSignUp = async (): Promise<void> => {
     // Validation
     const heightFtNum = parseInt(formData.heightFt);
     const heightInNum = parseInt(formData.heightIn);
     const weightLbsNum = parseFloat(formData.weightLbs);
     const ageNum = parseInt(formData.age);

     if (isNaN(heightFtNum) || heightFtNum < 0 || isNaN(heightInNum) || heightInNum < 0 || heightInNum >= 12) {
         toast({ variant: "destructive", title: 'Invalid Height', description: 'Please enter valid feet and inches (0-11).' });
         return;
     }
     if (isNaN(weightLbsNum) || weightLbsNum <= 0) {
         toast({ variant: "destructive", title: 'Invalid Weight', description: 'Please enter a valid weight in pounds.' });
         return;
     }
     if (isNaN(ageNum) || ageNum <= 0) {
         toast({ variant: "destructive", title: 'Invalid Age', description: 'Please enter a valid age.' });
         return;
     }
      if (!formData.name.trim()) {
         toast({ variant: "destructive", title: 'Missing Name', description: 'Please enter your name.' });
         return;
      }
       if (!formData.email.trim() || !formData.password) {
          toast({ variant: "destructive", title: 'Missing Credentials', description: 'Email and password are required.' });
          return;
       }

    try {
      // --- Firebase Authentication Removed ---
      // const auth = getAuth();
      // const db = getFirestore();
      // const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      // const user = userCredential.user;
      // if (!user) throw new Error("User not found after creation");
      // const userDocRef = doc(db, 'users', user.uid);
      // await setDoc(userDocRef, { ... });
      // --- End Firebase Removal ---

      // Use demo user ID or a simple placeholder for local storage
      const userId = `demo_${Date.now()}`;

      // Store user information in localStorage (simulates login)
      localStorage.setItem('user', JSON.stringify({ id: userId, email: formData.email }));

      // Store profile data in localStorage using the new structure
      localStorage.setItem('profileData', JSON.stringify({
        name: formData.name,
        email: formData.email, // Keep email if needed for display, though not used for auth here
        age: ageNum,
        heightFt: heightFtNum,
        heightIn: heightInNum,
        weightLbs: weightLbsNum,
        fitnessGoal: 'Maintain', // Default goal
      }));

       localStorage.removeItem('onboardingPage'); // Clear onboarding progress

      toast({id: "user-created",
        title: 'Signup successful',
        description: 'Your profile has been created.',
      });
      router.push('/home'); // Navigate to home after successful setup
    } catch (error: any) {
      // Keep basic error handling for potential issues (though Firebase errors are removed)
      toast({
        id: "user-creation-failed",
        variant: 'destructive',
        title: 'Sign up failed',
        description: error.message || "An unknown error occurred.",
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
            <Button variant="secondary" onClick={handleBack}>
              {currentPageNumber === 1 ? 'Cancel' : 'Back'}
            </Button>
            <Button onClick={handleNext}>
              {currentPageNumber < totalPages ? 'Next' : 'Complete Sign Up'}
            </Button>
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
      </div>
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
          min="0"
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
      {/* Height Input */}
      <div className="space-y-2">
          <Label>Height</Label>
          <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="heightFt" className="text-xs text-muted-foreground">Feet</Label>
                <Input
                  type="number"
                  id="heightFt"
                  value={formData.heightFt}
                  onChange={(e) => setFormData({ ...formData, heightFt: e.target.value })}
                  placeholder="ft"
                  min="0"
                  required
                  className="mt-1"
                />
              </div>
              <div className="flex-1">
                 <Label htmlFor="heightIn" className="text-xs text-muted-foreground">Inches</Label>
                  <Input
                      type="number"
                      id="heightIn"
                      value={formData.heightIn}
                      onChange={(e) => setFormData({ ...formData, heightIn: e.target.value })}
                      placeholder="in"
                      min="0"
                      max="11" // Inches < 12
                      required
                      className="mt-1"
                  />
              </div>
          </div>
        </div>
        {/* Weight Input */}
        <div>
            <Label htmlFor="weightLbs">Weight (lbs)</Label>
            <Input
              type="number"
              id="weightLbs"
              value={formData.weightLbs}
              onChange={(e) => setFormData({ ...formData, weightLbs: e.target.value })}
              placeholder="Your Weight in lbs"
              required
              min="0"
              step="0.1" // Allow decimal for lbs
              className="mt-1"
            />
        </div>
    </div>
  );
};

export default OnboardingPage;

const OnboardingSteps = ['signup', 'personal-info', 'profile'];
