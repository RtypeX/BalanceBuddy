'use client';

import WorkoutBuilder from '@/components/WorkoutBuilder';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";

const WorkoutBuilderPage = () => {
    const router = useRouter();

    return (
        <div>
            <div className="flex items-center justify-between p-4">
                <h1 className="text-2xl font-semibold">Workout Builder</h1>
                <Button variant="secondary" onClick={() => router.push('/home')}>Back to Home</Button>
            </div>
            <WorkoutBuilder />
        </div>
    );
};

export default WorkoutBuilderPage;
