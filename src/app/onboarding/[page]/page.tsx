
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useParams, useRouter } from 'next/navigation'; // Added useParams
import React, { useState, type FC, useEffect } from 'react';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { Button } from '@/components/ui/button';
import { getFirebase } from "@/lib/firebaseClient"; 
import { differenceInYears, isValid } from 'date-fns';


interface OnboardingPageProps {
  params: { // This comes from Next.js for dynamic routes
    page: string;
  };
}

type OnboardingStep = 'signup' | 'personal-info' | 'profile';
const OnboardingSteps: OnboardingStep[] = ['signup', 'personal-info', 'profile'];


interface OnboardingStepProps {
  step: OnboardingStep;
  formData: Record<string, string | number | undefined>;
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

const OnboardingPage: FC<OnboardingPageProps> = ({ params: serverSideParams }) => {
  const router = useRouter();
  const clientRouteParams = useParams(); 
  const { toast } = useToast();
  const firebase = getFirebase();

  const getInitialPageNumber = (): number => {
    let pageNumStr: string | string[] | undefined = clientRouteParams?.page;

    // If clientRouteParams.page is not yet available or is an array, try serverSideParams
    if (!pageNumStr || Array.isArray(pageNumStr)) {
      pageNumStr = serverSideParams?.page;
    }
    
    // If pageNumStr is still an array (should not happen with this setup ideally), take the first element
    if (Array.isArray(pageNumStr)) {
      pageNumStr = pageNumStr[0];
    }

    if (typeof pageNumStr === 'string') {
      const num = parseInt(pageNumStr, 10);
      if (!isNaN(num) && OnboardingSteps[num - 1]) {
        return num;
      }
    }

    if (typeof window !== 'undefined') {
        const storedPage = localStorage.getItem('onboardingPage');
        if (storedPage) {
            const num = parseInt(storedPage, 10);
            if (!isNaN(num) && OnboardingSteps[num-1]) return num;
        }
    }
    return 1; 
  };


  const [currentPageNumber, setCurrentPageNumber] = useState<number>(getInitialPageNumber());


  useEffect(() => {
    const currentPath = `/onboarding/${currentPageNumber}`;
    if (typeof window !== 'undefined' && window.location.pathname !== currentPath) {
      router.replace(currentPath, { scroll: false });
    }
    if (typeof window !== 'undefined') {
        localStorage.setItem('onboardingPage', String(currentPageNumber));
    }
  }, [currentPageNumber, router]);

  useEffect(() => {
    let pageNumFromRoute: number | undefined = undefined;
    let pageParamSource: string | string[] | undefined = clientRouteParams?.page;

    if (!pageParamSource || Array.isArray(pageParamSource)) {
        pageParamSource = serverSideParams?.page;
    }
    if (Array.isArray(pageParamSource)) {
        pageParamSource = pageParamSource[0];
    }


    if (typeof pageParamSource === 'string') {
      const num = parseInt(pageParamSource, 10);
      if (!isNaN(num) && OnboardingSteps[num - 1]) {
        pageNumFromRoute = num;
      }
    }

    if (pageNumFromRoute !== undefined && pageNumFromRoute !== currentPageNumber) {
      setCurrentPageNumber(pageNumFromRoute);
    } else if (pageNumFromRoute === undefined && (clientRouteParams?.page || serverSideParams?.page)) {
        // URL has a page param, but it's invalid
        const safePage = 1; // Default to 1 if URL param is bad
        if (safePage !== currentPageNumber) {
            setCurrentPageNumber(safePage); 
        }
    }
  }, [clientRouteParams, serverSideParams, currentPageNumber, router]);


  const currentStep = OnboardingSteps[currentPageNumber - 1];

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

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    heightFt: '',
    heightIn: '',
    weightLbs: '',
    birthMonth: '',
    birthDay: '',
    birthYear: '',
  });

  const totalPages = OnboardingSteps.length;
  const progress = (currentPageNumber / totalPages) * 100;

  const handleNext = () => {
    if (currentPageNumber < totalPages) {
      const nextPage = currentPageNumber + 1;
      setCurrentPageNumber(nextPage); 
    } else {
      completeSignUp();
    }
  };

  const handleBack = () => {
    if (currentPageNumber > 1) {
      const prevPage = currentPageNumber - 1;
      setCurrentPageNumber(prevPage); 
    } else {
      localStorage.removeItem('onboardingPage');
      localStorage.removeItem('onboardingUserEmail');
      router.push('/');
    }
  };

 const completeSignUp = async (): Promise<void> => {
    if (!firebase.app || !firebase.auth || !firebase.db) {
        toast({ variant: "destructive", title: 'Initialization Error', description: 'Firebase is not configured correctly. Please try again later.' });
        return;
    }

    if (!formData.birthMonth?.trim() || !formData.birthDay?.trim() || !formData.birthYear?.trim()) {
        toast({ variant: "destructive", title: 'Missing Date of Birth', description: 'Please enter your complete date of birth (month, day, and year).' });
        return;
    }

    const month = parseInt(formData.birthMonth, 10);
    const day = parseInt(formData.birthDay, 10);
    const year = parseInt(formData.birthYear, 10);

    if (isNaN(month) || month < 1 || month > 12 ||
        isNaN(day) || day < 1 || day > 31 ||
        isNaN(year) || year < (new Date().getFullYear() - 100) || year > (new Date().getFullYear() - 16)) {
        toast({ variant: "destructive", title: 'Invalid Date of Birth Format', description: 'Please enter a valid month (1-12), day (1-31), and year (you must be 16-100 years old).' });
        return;
    }

    const dateOfBirth = new Date(year, month - 1, day);

    if (!isValid(dateOfBirth) || dateOfBirth.getFullYear() !== year || dateOfBirth.getMonth() !== month - 1 || dateOfBirth.getDate() !== day) {
         toast({ variant: "destructive", title: 'Invalid Calendar Date', description: 'The date of birth entered is not a valid calendar date (e.g., February 30th).' });
        return;
    }

    const ageNum = differenceInYears(new Date(), dateOfBirth);
    if (ageNum < 16 || ageNum > 100) {
      toast({ variant: "destructive", title: 'Age Requirement Not Met', description: 'You must be between 16 and 100 years old to sign up.' });
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
    if (formData.password.length < 6) {
        toast({ variant: "destructive", title: 'Weak Password', description: 'Password must be at least 6 characters long.' });
        return;
    }

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
      const auth = getAuth(firebase.app);
      const db = getFirestore(firebase.app);

      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      if (!user) {
        throw new Error("User creation failed at Firebase Auth level.");
      }

      await setDoc(doc(db, "users", user.uid), {
        name: formData.name,
        email: formData.email,
        dateOfBirth: dateOfBirth.toISOString().split('T')[0],
        age: ageNum,
        heightFt: heightFtNum,
        heightIn: heightInNum,
        weightLbs: weightLbsNum,
        fitnessGoal: 'Maintain',
      });

      localStorage.setItem('user', JSON.stringify({ id: user.uid, email: formData.email }));
      localStorage.removeItem('onboardingPage');
      localStorage.removeItem('onboardingUserEmail');

      toast({
        id: "user-created",
        title: 'Signup successful',
        description: 'Your profile has been created.',
      });
      router.push('/home');
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
              {currentPageNumber < totalPages ? 'Next' : 'Complete Sign Up'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface SignupFormProps {
  formData: Record<string, string | number | undefined>;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const SignupForm: React.FC<SignupFormProps> = ({ formData, setFormData }) => {
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setFormData({ ...formData, email: newEmail });
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
          minLength={6}
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
  formData: Record<string, string | number | undefined>;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
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
            <Input
              type="number"
              id="birthMonth"
              value={formData.birthMonth as string || ''}
              onChange={(e) => setFormData({ ...formData, birthMonth: e.target.value })}
              placeholder="MM"
              min="1"
              max="12"
              required
              className="mt-1"
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="birthDay" className="text-xs text-muted-foreground">Day (DD)</Label>
            <Input
              type="number"
              id="birthDay"
              value={formData.birthDay as string || ''}
              onChange={(e) => setFormData({ ...formData, birthDay: e.target.value })}
              placeholder="DD"
              min="1"
              max="31"
              required
              className="mt-1"
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="birthYear" className="text-xs text-muted-foreground">Year (YYYY)</Label>
            <Input
              type="number"
              id="birthYear"
              value={formData.birthYear as string || ''}
              onChange={(e) => setFormData({ ...formData, birthYear: e.target.value })}
              placeholder="YYYY"
              min={minYear}
              max={maxYear}
              required
              className="mt-1"
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground pt-1">You must be between 16 and 100 years old.</p>
      </div>
    </div>
  );
};

interface ProfileFormProps {
  formData: Record<string, string | number | undefined>;
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

