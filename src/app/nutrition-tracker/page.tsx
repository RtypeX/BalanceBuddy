
'use client';

import NutritionTracker from '@/components/NutritionTracker';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";

const NutritionTrackerPage = () => {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-start min-h-screen py-6 px-4">
             <div className="flex items-center justify-between p-4 w-full max-w-3xl mb-4"> {/* Adjust max-width as needed */}
                <h1 className="text-2xl font-semibold">Nutrition Tracker</h1>
                <Button variant="secondary" onClick={() => router.push('/home')}>Back to Home</Button>
            </div>
            <div className="w-full max-w-3xl"> {/* Adjust max-width as needed */}
                <NutritionTracker />
            </div>
        </div>
    );
};

export default NutritionTrackerPage;
