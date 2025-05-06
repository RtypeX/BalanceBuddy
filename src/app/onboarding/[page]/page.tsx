'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import React, { useState, type FC, useEffect, use } from 'react';
import { Button } from '@/components/ui/button';
import { getFirebase } from "@/lib/firebaseClient"; // Assuming this is correctly configured for Firebase v9+
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { DatePicker } from '@/components/ui/date-picker'; // Assuming you have this component
import { differenceInYears, isValid } from 'date-fns';


interface OnboardingPageProps {
  params: {
    page: string;
  };
}

interface OnboardingStepProps {
  step: OnboardingStep;
  formData: Record<string, string | number | Date | undefined>;
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
  // Attempt to read page from localStorage first, then fallback to params.
  // This helps maintain state if the user navigates away and comes back,
  // or if there's a refresh, but params are the source of truth for direct navigation.
  const getInitialPage = () => {
    if (typeof window !== 'undefined') {
      const storedPage = localStorage.getItem('onboardingPage');
      if (storedPage && OnboardingSteps[parseInt(storedPage, 10) - 1]) {
        // If navigating directly to a different step via URL, prioritize URL param
        if (params.page && params.page !== storedPage) {
            localStorage.setItem('onboardingPage', params.page);
            return parseInt(params.page, 10);
        }
        return parseInt(storedPage, 10);
      }
    }
    // Fallback to params.page if no valid stored page or if direct navigation
    const paramPageNum = parseInt(params.page, 10);
    if (!isNaN(paramPageNum) && OnboardingSteps[paramPageNum - 1]) {
        if (typeof window !== 'undefined') {
            localStorage.setItem('onboardingPage', String(paramPageNum));
        }
        return paramPageNum;
    }
    return 1; // Default to page 1 if param is invalid
  };


  const [currentPageNumber, setCurrentPageNumber] = useState<number>(getInitialPage());

  // Effect to sync URL with state and localStorage
  useEffect(() => {
    const currentPath = `/onboarding/${currentPageNumber}`;
    if (window.location.pathname !== currentPath) {
      router.replace(currentPath, { scroll: false });
    }
    localStorage.setItem('onboardingPage', String(currentPageNumber));
  }, [currentPageNumber, router]);

  // Effect to handle direct URL changes or browser back/forward
  useEffect(() => {
    const paramPageNum = parseInt(params.page, 10);
    if (!isNaN(paramPageNum) && paramPageNum !== currentPageNumber && OnboardingSteps[paramPageNum -1]) {
      setCurrentPageNumber(paramPageNum);
    } else if (isNaN(paramPageNum) || !OnboardingSteps[paramPageNum-1]) {
      // If URL param is invalid, reset to a valid page (e.g., first page or stored page)
      setCurrentPageNumber(getInitialPage());
    }
  }, [params.page]);


  const currentStep = OnboardingSteps[currentPageNumber - 1];
  const { toast } = useToast();
  const firebase = getFirebase();

  useEffect(() => {
    // For demo, we'll rely on localStorage for "user started" flag
    // In a real app, Firebase auth state would be the source of truth
    const userStartedOnboarding = localStorage.getItem('onboardingUserEmail');
    if (!userStartedOnboarding && currentPageNumber > 1) {
      // If trying to access later steps without starting signup, redirect
      router.push('/onboarding/1');
    }
  }, [router, currentPageNumber]);


  const getStepTitle = () => {
    switch (currentStep) {
      case 'signup':
        return 'Create Your Account';
      case 'personal-info':
        return 'Personal Information';
      case 'profile':
        return 'Finish Profile';
      default:
        return 'Onboarding';
    }
  };

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    age: '', // Will be calculated from dateOfBirth
    heightFt: '',
    heightIn: '',
    weightLbs: '',
    dateOfBirth: undefined as Date | undefined,
  });

  const totalPages = OnboardingSteps.length;
  const progress = (currentPageNumber / totalPages) * 100;

  const handleNext = () => {
    if (currentPageNumber < totalPages) {
      const nextPage = currentPageNumber + 1;
      setCurrentPageNumber(nextPage);
      // router.push will be handled by the useEffect syncing URL
    } else {
      completeSignUp();
    }
  };

  const handleBack = () => {
    if (currentPageNumber > 1) {
      const prevPage = currentPageNumber - 1;
      setCurrentPageNumber(prevPage);
      // router.push will be handled by the useEffect syncing URL
    } else {
      localStorage.removeItem('onboardingPage');
      localStorage.removeItem('onboardingUserEmail'); // Clear if they cancel from first step
      router.push('/');
    }
  };

 const completeSignUp = async (): Promise<void> => {
    // Validation
    if (!formData.dateOfBirth || !isValid(formData.dateOfBirth)) {
        toast({ variant: "destructive", title: 'Invalid Date of Birth', description: 'Please select a valid date of birth.' });
        return;
    }

    const ageNum = differenceInYears(new Date(), formData.dateOfBirth);
    if (isNaN(ageNum) || ageNum < 16 || ageNum > 100) {
      toast({ variant: "destructive", title: 'Invalid Age', description: 'You must be between 16 and 100 years old to sign up.' });
      return;
    }

    const heightFtNum = parseInt(formData.heightFt);
    const heightInNum = parseInt(formData.heightIn);
    const weightLbsNum = parseFloat(formData.weightLbs);

    if (isNaN(heightFtNum) || heightFtNum < 0 || isNaN(heightInNum) || heightInNum < 0 || heightInNum >= 12) {
        toast({ variant: "destructive", title: 'Invalid Height', description: 'Please enter valid feet and inches (0-11).' });
        return;
    }
    if (isNaN(weightLbsNum) || weightLbsNum <= 0) {
        toast({ variant: "destructive", title: 'Invalid Weight', description: 'Please enter a valid weight in pounds.' });
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
      // For demo, we simulate user creation and data saving
      // In a real app, this would involve Firebase Auth and Firestore
      const auth = getAuth(firebase.app); // Get auth instance from initialized firebase app
      const db = getFirestore(firebase.app); // Get firestore instance

      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      if (!user) {
        throw new Error("User creation failed.");
      }

      // Save additional profile data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: formData.name,
        email: formData.email,
        dateOfBirth: formData.dateOfBirth.toISOString().split('T')[0], // Store as YYYY-MM-DD string
        age: ageNum, // Store calculated age
        heightFt: heightFtNum,
        heightIn: heightInNum,
        weightLbs: weightLbsNum,
        fitnessGoal: 'Maintain', // Default goal
      });

      // Store user info (e.g., UID, email) in localStorage to simulate session
      localStorage.setItem('user', JSON.stringify({ id: user.uid, email: formData.email }));
      localStorage.removeItem('onboardingPage'); // Clear onboarding progress
      localStorage.removeItem('onboardingUserEmail');

      toast({
        id: "user-created",
        title: 'Signup successful',
        description: 'Your profile has been created.',
      });
      router.push('/home'); // Navigate to home after successful setup
    } catch (error: any) {
      let errorMessage = "An unknown error occurred during signup.";
      if (error.code) {
        switch (error.code) {
          case "auth/email-already-in-use":
            errorMessage = "This email address is already in use.";
            break;
          case "auth/weak-password":
            errorMessage = "Password is too weak. Please choose a stronger password.";
            break;
          case "auth/invalid-email":
            errorMessage = "The email address is not valid.";
            break;
          default:
            errorMessage = error.message || "Failed to sign up.";
        }
      } else if (error.message) {
        errorMessage = error.message;
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
      <Card className="w-full max-w-md shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold">{getStepTitle()}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <Progress value={progress} className='mb-6 h-2.5' />
          <OnboardingStepComponent step={currentStep} formData={formData} setFormData={setFormData} />
          <div className='flex justify-between pt-4'>
            <Button variant="outline" onClick={handleBack} className="px-6 py-2">
              {currentPageNumber === 1 ? 'Cancel' : 'Back'}
            </Button>
            <Button onClick={handleNext} className="px-6 py-2">
              {currentPageNumber < totalPages ? 'Next' : 'Complete Sign Up'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface SignupFormProps {
  formData: Record<string, string | number | Date | undefined>;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const SignupForm: React.FC<SignupFormProps> = ({ formData, setFormData }) => {
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setFormData({ ...formData, email: newEmail });
    // Store email in localStorage to persist across steps if needed for demo logic
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboardingUserEmail', newEmail);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          type="email"
          id="email"
          value={formData.email as string || ''}
          onChange={handleEmailChange}
          placeholder="your.email@example.com"
          required
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          type="password"
          id="password"
          value={formData.password as string || ''}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="Create a strong password"
          required
          minLength={6} // Basic password strength
          className="mt-1"
        />
      </div>
       <div>
        <Label htmlFor="name">Full Name</Label>
        <Input
          type="text"
          id="name"
          value={formData.name as string || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Your Full Name"
          required
          className="mt-1"
        />
      </div>
    </div>
  );
};

interface PersonalInfoFormProps {
  formData: Record<string, string | number | Date | undefined>;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ formData, setFormData }) => {
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 16); // Must be at least 16
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 100); // Not older than 100

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="dateOfBirth">Date of Birth</Label>
        <DatePicker
          date={formData.dateOfBirth as Date | undefined}
          setDate={(date) => setFormData({ ...formData, dateOfBirth: date })}
          // You might need to adjust your DatePicker to accept date range constraints
          // For now, validation is handled on submission
        />
         <p className="text-xs text-muted-foreground pt-1">You must be between 16 and 100 years old.</p>
      </div>
    </div>
  );
};

interface ProfileFormProps {
  formData: Record<string, string | number | Date | undefined>;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ formData, setFormData }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
          <Label>Height</Label>
          <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="heightFt" className="text-xs text-muted-foreground">Feet</Label>
                <Input
                  type="number"
                  id="heightFt"
                  value={formData.heightFt as string || ''}
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
                      value={formData.heightIn as string || ''}
                      onChange={(e) => setFormData({ ...formData, heightIn: e.target.value })}
                      placeholder="in"
                      min="0"
                      max="11"
                      required
                      className="mt-1"
                  />
              </div>
          </div>
        </div>
        <div>
            <Label htmlFor="weightLbs">Weight (lbs)</Label>
            <Input
              type="number"
              id="weightLbs"
              value={formData.weightLbs as string || ''}
              onChange={(e) => setFormData({ ...formData, weightLbs: e.target.value })}
              placeholder="Your Weight in lbs"
              required
              min="0"
              step="0.1"
              className="mt-1"
            />
        </div>
    </div>
  );
};

export default OnboardingPage;

const OnboardingSteps = ['signup', 'personal-info', 'profile'];
