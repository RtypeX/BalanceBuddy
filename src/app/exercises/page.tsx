'use client';

import ExerciseList from '@/components/ExerciseList';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";

const ExercisesPage = () => {
    const router = useRouter();

    return (
        <div>
            <div className="flex items-center justify-between p-4">
                <h1 className="text-2xl font-semibold">Exercises</h1>
                <Button variant="secondary" onClick={() => router.push('/home')}>Back to Home</Button>
            </div>
            <ExerciseList />
        </div>
    );
};

export default ExercisesPage;
