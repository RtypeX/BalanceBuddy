'use client';

import FastingCalendar from '@/components/FastingCalendar';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";

const FastingCalendarPage = () => {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-start min-h-screen py-6 px-4">
            <div className="flex items-center justify-between p-4 w-full max-w-md mb-4">
                <h1 className="text-2xl font-semibold">Fasting Tracker</h1>
                <Button variant="secondary" onClick={() => router.push('/home')}>Back to Home</Button>
            </div>
            {/* FastingCalendar component now handles its own max-width */}
            <FastingCalendar />
        </div>
    );
};

export default FastingCalendarPage;
