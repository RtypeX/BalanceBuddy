
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation'; // useParams can be used for client-side route info if needed
import React, { useState, type FC, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { getFirebase } from "@/lib/firebaseClient";
import { differenceInYears, isValid } from 'date-fns';
import { createUserWithEmailAndPassword } from 'firebase/auth';

// Define the structure for profile data
interface OnboardingFormData {
  email: string;
  password: string;
  name: string;
  heightFt: string;
  heightIn: string;
  weightLbs: string;
  birthMonth: string;
  birthDay: string;
  birthYear: string;
}

type OnboardingStep = 'signup' | 'personal-info' | 'profile';
const OnboardingStepsMap: Record<string, OnboardingStep> = {
  '1': 'signup',
  '2': 'personal-info',
  '3': 'profile',
};
const TotalOnboardingSteps = Object.keys(OnboardingStepsMap).length;


interface OnboardingClientProps {
  initialPage: string; // Passed from the server component
}

interface OnboardingStepComponentProps {
  step: OnboardingStep;
  formData: OnboardingFormData;
  setFormData: React.Dispatch<React.SetStateAction<OnboardingFormData>>;
}

const OnboardingStepComponent: React.FC<OnboardingStepComponentProps> = ({ step, formData, setFormData }) => {
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

const OnboardingClient: FC<OnboardingClientProps> = ({ initialPage }) => {
  const router = useRouter();
  const clientParams = useParams(); // Can be used to get current dynamic segmen
  const { toast } = useToast();
  const firebaseInstances = getFirebase();

  const getValidatedPageNumber = (pageStr: string | string[] | undefined): number => {
    let pageNumStr = pageStr;
    if (Array.isArray(pageNumStr)) {
      pageNumStr = pageNumStr[0];
    }
    if (typeof pageNumStr === 'string') {
      const num = parseInt(pageNumStr, 10);
      if (!isNaN(num) && num >= 1 && num <= TotalOnboardingSteps) {
        return num;
      }
    }
    return 1; // Default to page 1 if invalid
  };

  // Initialize currentPageNumber from initialPage prop
  const [currentPageNumber, setCurrentPageNumber] = useState<number>(getValidatedPageNumber(initialPage));

  // Effect to sync URL with currentPageNumber state
  useEffect(() => {
    const currentPath = `/onboarding/${currentPageNumber}`;
    // Check if the current browser path matches the state. If not, replace.
    // This handles browser back/forward navigation.
    if (typeof window !== 'undefined' && window.location.pathname !== currentPath) {
      router.replace(currentPath, { scroll: false });
    }
    // Persist the current page number to localStorage
    if (typeof window !== 'undefined') {
        localStorage.setItem('onboardingPage', String(currentPageNumber));
    }
  }, [currentPageNumber, router]);

  // Effect to update currentPageNumber if the dynamic segment from URL changes
  // This handles cases where the URL is changed directly by the user or other means
  useEffect(() => {
    const pageFromRoute = getValidatedPageNumber(clientParams?.page);
    if (pageFromRoute !== currentPageNumber) {
      setCurrentPageNumber(pageFromRoute);
    }
  }, [clientParams, currentPageNumber]);


  const currentStepKey = String(currentPageNumber);
  const currentStep = OnboardingStepsMap[currentStepKey] || 'signup';


  // Redirect if user hasn't started onboarding (based on email) and tries to access later steps
  useEffect(() => {
    const userStartedOnboarding = localStorage.getItem('onboardingUserEmail');
    if (!userStartedOnboarding && currentPageNumber > 1) {
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

  const [formData, setFormData] = useState<OnboardingFormData>(() => {
    if (typeof window !== 'undefined') {
      const storedFormData = localStorage.getItem('onboardingFormData');
      if (storedFormData) {
        try {
          const parsed = JSON.parse(storedFormData);
          // Ensure all fields are present and are strings, provide defaults if not
          return {
            email: String(parsed.email || ''),
            password: String(parsed.password || ''),
            name: String(parsed.name || ''),
            heightFt: String(parsed.heightFt || ''),
            heightIn: String(parsed.heightIn || ''),
            weightLbs: String(parsed.weightLbs || ''),
            birthMonth: String(parsed.birthMonth || ''),
            birthDay: String(parsed.birthDay || ''),
            birthYear: String(parsed.birthYear || ''),
          };
        } catch (e) {
          console.error("Failed to parse onboardingFormData from localStorage", e);
        }
      }
    }
    return {
      email: '', password: '', name: '',
      heightFt: '', heightIn: '', weightLbs: '',
      birthMonth: '', birthDay: '', birthYear: '',
    };
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboardingFormData', JSON.stringify(formData));
    }
  }, [formData]);

  const progress = (currentPageNumber / TotalOnboardingSteps) * 100;

  const handleNext = () => {
    if (currentPageNumber < TotalOnboardingSteps) {
      const nextPage = currentPageNumber + 1;
      setCurrentPageNumber(nextPage); // This will trigger the useEffect to update URL and localStorage
    } else {
      completeSignUp();
    }
  };

  const handleBack = () => {
    if (currentPageNumber > 1) {
      const prevPage = currentPageNumber - 1;
      setCurrentPageNumber(prevPage); // This will trigger the useEffect
    } else {
      localStorage.removeItem('onboardingPage');
      localStorage.removeItem('onboardingUserEmail');
      localStorage.removeItem('onboardingFormData');
      router.push('/');
    }
  };

 const completeSignUp = async (): Promise<void> => {
    if (!firebaseInstances.auth) {
        toast({ variant: "destructive", title: 'Initialization Error', description: 'Firebase Auth is not configured correctly.' });
        return;
    }

    const monthIsEmpty = !formData.birthMonth.trim();
    const dayIsEmpty = !formData.birthDay.trim();
    const yearIsEmpty = !formData.birthYear.trim();

    if (monthIsEmpty || dayIsEmpty || yearIsEmpty) {
        let missingFields = [];
        if (monthIsEmpty) missingFields.push("month");
        if (dayIsEmpty) missingFields.push("day");
        if (yearIsEmpty) missingFields.push("year");
        toast({ variant: "destructive", title: 'Missing Date of Birth', description: `Please enter your full date of birth. Missing: ${missingFields.join(', ')}.`});
        return;
    }

    const month = parseInt(formData.birthMonth, 10);
    const day = parseInt(formData.birthDay, 10);
    const year = parseInt(formData.birthYear, 10);

    if (isNaN(month) || month < 1 || month > 12 ||
        isNaN(day) || day < 1 || day > 31 ||
        isNaN(year) || year < (new Date().getFullYear() - 100) || year > (new Date().getFullYear() - 16)) {
        toast({ variant: "destructive", title: 'Invalid Date of Birth Format', description: 'Please enter a valid month (1-12), day (1-31), and year (16-100 years old).' });
        return;
    }
    const dateOfBirth = new Date(year, month - 1, day);
    if (!isValid(dateOfBirth) || dateOfBirth.getFullYear() !== year || dateOfBirth.getMonth() !== month - 1 || dateOfBirth.getDate() !== day) {
         toast({ variant: "destructive", title: 'Invalid Calendar Date', description: 'The date of birth entered is not a valid calendar date.' });
        return;
    }
    const ageNum = differenceInYears(new Date(), dateOfBirth);
    if (ageNum < 16 || ageNum > 100) {
      toast({ variant: "destructive", title: 'Age Requirement Not Met', description: 'You must be between 16 and 100 years old.' });
      return;
    }

    if (!formData.name.trim()) { toast({ variant: "destructive", title: 'Missing Name', description: 'Please enter your name.' }); return; }
    if (!formData.email.trim() || !formData.password) { toast({ variant: "destructive", title: 'Missing Credentials', description: 'Email and password are required.' }); return; }
    if (formData.password.length < 6) { toast({ variant: "destructive", title: 'Weak Password', description: 'Password must be at least 6 characters long.' }); return; }

    const heightFtNum = parseInt(formData.heightFt, 10);
    const heightInNum = parseInt(formData.heightIn, 10);
    const weightLbsNum = parseFloat(formData.weightLbs);

    if (isNaN(heightFtNum) || heightFtNum < 0 || isNaN(heightInNum) || heightInNum < 0 || heightInNum >= 12) {
        toast({ variant: "destructive", title: 'Invalid Height', description: 'Please enter valid feet and inches (inches 0-11).' });
        return;
    }
    if (isNaN(weightLbsNum) || weightLbsNum <= 0) {
        toast({ variant: "destructive", title: 'Invalid Weight', description: 'Please enter a valid weight in pounds.' });
        return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(firebaseInstances.auth, formData.email, formData.password);
      const user = userCredential.user;
      if (!user) throw new Error("User creation failed at Firebase Auth level.");

      const profileDataToStore = {
          name: formData.name, email: formData.email, dateOfBirth: dateOfBirth.toISOString().split('T')[0],
          age: ageNum, heightFt: heightFtNum, heightIn: heightInNum, weightLbs: weightLbsNum, fitnessGoal: 'Maintain',
      };
      localStorage.setItem('profileData', JSON.stringify(profileDataToStore));
      localStorage.setItem('user', JSON.stringify({ id: user.uid, email: formData.email }));
      localStorage.removeItem('onboardingPage');
      localStorage.removeItem('onboardingUserEmail');
      localStorage.removeItem('onboardingFormData');
      toast({ id: "user-created", title: 'Signup successful', description: 'Your account has been created.' });
      router.push('/home');
    } catch (error: any) {
      let errorMessage = "An unknown error occurred.";
      if (error.code) {
        switch (error.code) {
          case "auth/email-already-in-use": errorMessage = "This email address is already in use."; break;
          case "auth/weak-password": errorMessage = "Password is too weak."; break;
          case "auth/invalid-email": errorMessage = "The email address is not valid."; break;
          default: errorMessage = error.message || "Failed to sign up.";
        }
      } else if (error.message) { errorMessage = error.message; }
      toast({ id: "user-creation-failed", variant: 'destructive', title: 'Sign up failed', description: errorMessage });
      console.error("Signup Error Details:", error);
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
              {currentPageNumber < TotalOnboardingSteps ? 'Next' : 'Complete Sign Up'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface SignupFormProps {
  formData: OnboardingFormData;
  setFormData: React.Dispatch<React.SetStateAction<OnboardingFormData>>;
}

const SignupForm: React.FC<SignupFormProps> = ({ formData, setFormData }) => {
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setFormData(prev => ({ ...prev, email: newEmail }));
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboardingUserEmail', newEmail);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input type="email" id="email" value={formData.email} onChange={handleEmailChange} placeholder="your.email@example.com" required className="mt-1"/>
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input type="password" id="password" value={formData.password} onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))} placeholder="Create a strong password" required minLength={6} className="mt-1"/>
      </div>
       <div>
        <Label htmlFor="name">Full Name</Label>
        <Input type="text" id="name" value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="Your Full Name" required className="mt-1"/>
      </div>
    </div>
  );
};

interface PersonalInfoFormProps {
  formData: OnboardingFormData;
  setFormData: React.Dispatch<React.SetStateAction<OnboardingFormData>>;
}

const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ formData, setFormData }) => {
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 100;
  const maxYear = currentYear - 16;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Date of Birth</Label>
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="birthMonth" className="text-xs text-muted-foreground">Month (MM)</Label>
            <Input type="number" id="birthMonth" value={formData.birthMonth} onChange={e => setFormData(prev => ({ ...prev, birthMonth: e.target.value }))} placeholder="MM" min="1" max="12" required className="mt-1"/>
          </div>
          <div className="flex-1">
            <Label htmlFor="birthDay" className="text-xs text-muted-foreground">Day (DD)</Label>
            <Input type="number" id="birthDay" value={formData.birthDay} onChange={e => setFormData(prev => ({ ...prev, birthDay: e.target.value }))} placeholder="DD" min="1" max="31" required className="mt-1"/>
          </div>
          <div className="flex-1">
            <Label htmlFor="birthYear" className="text-xs text-muted-foreground">Year (YYYY)</Label>
            <Input type="number" id="birthYear" value={formData.birthYear} onChange={e => setFormData(prev => ({ ...prev, birthYear: e.target.value }))} placeholder="YYYY" min={minYear} max={maxYear} required className="mt-1"/>
          </div>
        </div>
        <p className="text-xs text-muted-foreground pt-1">You must be between 16 and 100 years old.</p>
      </div>
    </div>
  );
};

interface ProfileFormProps {
  formData: OnboardingFormData;
  setFormData: React.Dispatch<React.SetStateAction<OnboardingFormData>>;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ formData, setFormData }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
          <Label>Height</Label>
          <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="heightFt" className="text-xs text-muted-foreground">Feet</Label>
                <Input type="number" id="heightFt" value={formData.heightFt} onChange={e => setFormData(prev => ({ ...prev, heightFt: e.target.value }))} placeholder="ft" min="0" required className="mt-1"/>
              </div>
              <div className="flex-1">
                 <Label htmlFor="heightIn" className="text-xs text-muted-foreground">Inches</Label>
                  <Input type="number" id="heightIn" value={formData.heightIn} onChange={e => setFormData(prev => ({ ...prev, heightIn: e.target.value }))} placeholder="in" min="0" max="11" required className="mt-1"/>
              </div>
          </div>
        </div>
        <div>
            <Label htmlFor="weightLbs">Weight (lbs)</Label>
            <Input type="number" id="weightLbs" value={formData.weightLbs} onChange={e => setFormData(prev => ({ ...prev, weightLbs: e.target.value }))} placeholder="Your Weight in lbs" required min="0" step="0.1" className="mt-1"/>
        </div>
    </div>
  );
};

export default OnboardingClient;
