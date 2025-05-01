'use client';

import WeightTracker from '@/components/WeightTracker';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";

const WeightTrackerPage = () => {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-start min-h-screen py-6 px-4">
             <div className="flex items-center justify-between p-4 w-full max-w-3xl mb-4"> {/* Increased max-width */}
                <h1 className="text-2xl font-semibold">Weight Tracker</h1>
                <Button variant="secondary" onClick={() => router.push('/home')}>Back to Home</Button>
            </div>
            <div className="w-full max-w-3xl"> {/* Increased max-width */}
                <WeightTracker />
            </div>
        </div>
    );
};

export default WeightTrackerPage;
