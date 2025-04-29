'use client';

import WorkoutBuilder from '@/components/WorkoutBuilder';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";

const WorkoutBuilderPage = () => {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            <div className="flex items-center justify-between p-4 w-full max-w-md">
                <h1 className="text-2xl font-semibold">Workout Builder</h1>
                <Button variant="secondary" onClick={() => router.push('/home')}>Back to Home</Button>
            </div>
            <div className="w-full max-w-md">
                <WorkoutBuilder />
            </div>
        </div>
    );
};

export default WorkoutBuilderPage;
