
import React from 'react';
import OnboardingClient from './onboarding-client'; // Import the new client component

// Define the structure for page parameters
interface OnboardingPageProps {
  params: {
    page: string;
  };
}

// Define the possible onboarding steps for static generation
const OnboardingSteps: string[] = ['1', '2', '3']; // Corresponds to page numbers

// Function to generate static paths for dynamic routes
export async function generateStaticParams() {
  return OnboardingSteps.map((page) => ({
    page: page,
  }));
}

// This is now a Server Component
const OnboardingPage: React.FC<OnboardingPageProps> = ({ params }) => {
  // The 'page' param is directly available from Next.js routing
  const pageNumberString = params.page;

  // Basic validation or fallback if the page number is unexpected,
  // though generateStaticParams should limit possibilities.
  if (!OnboardingSteps.includes(pageNumberString)) {
    // Handle invalid page number, e.g., redirect to the first step or show a 404
    // For simplicity, we can let the client component handle further validation if needed
    // or redirect here if desired.
    // For now, we'll pass it along. A robust app might redirect:
    // import { redirect } from 'next/navigation';
    // redirect('/onboarding/1');
  }

  return <OnboardingClient initialPage={pageNumberString} />;
};

export default OnboardingPage;
