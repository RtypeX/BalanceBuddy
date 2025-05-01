'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ModeToggle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Added Select imports
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation'; // Added useRouter

// Define the structure for profile data
interface ProfileData {
  name: string;
  age: number;
  height: number;
  weight: number;
  email: string;
  fitnessGoal: 'Lose Weight' | 'Gain Weight' | 'Maintain';
}

const ProfilePage = () => {
  const router = useRouter(); // Initialize router
  const { toast } = useToast(); // Initialize toast
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '', // Initialize with empty strings or default values
    age: 0,
    height: 0,
    weight: 0,
    email: '',
    fitnessGoal: 'Maintain', // Default goal
  });

  const [isEditing, setIsEditing] = useState(false);
  // Use a temporary state for edits to allow cancellation
  const [tempProfileData, setTempProfileData] = useState<ProfileData>({ ...profileData });
  const [isLoading, setIsLoading] = useState(true); // Loading state

  // Load profile data from local storage on component mount
  useEffect(() => {
    const storedProfileData = localStorage.getItem('profileData');
    const storedUser = localStorage.getItem('user'); // Get user for email fallback

    if (storedProfileData) {
      try {
        const parsedData = JSON.parse(storedProfileData);
        // Ensure all fields exist, provide defaults if not
        const validatedData: ProfileData = {
          name: parsedData.name || '',
          age: parseInt(parsedData.age, 10) || 0,
          height: parseInt(parsedData.height, 10) || 0,
          weight: parseInt(parsedData.weight, 10) || 0,
          email: parsedData.email || (storedUser ? JSON.parse(storedUser).email : ''), // Fallback to user email
          fitnessGoal: parsedData.fitnessGoal || 'Maintain',
        };
        setProfileData(validatedData);
        setTempProfileData(validatedData); // Initialize temp data as well
      } catch (error) {
        console.error("Failed to parse profile data from localStorage", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load profile data.",
        });
        // Initialize with defaults if parsing fails
        const defaultEmail = storedUser ? JSON.parse(storedUser).email : '';
        const defaultData: ProfileData = { name: '', age: 0, height: 0, weight: 0, email: defaultEmail, fitnessGoal: 'Maintain' };
        setProfileData(defaultData);
        setTempProfileData(defaultData);
      }
    } else if (storedUser) {
        // If no profile data, try initializing with user email
        const user = JSON.parse(storedUser);
        const initialData: ProfileData = { name: '', age: 0, height: 0, weight: 0, email: user.email, fitnessGoal: 'Maintain' };
        setProfileData(initialData);
        setTempProfileData(initialData);
        localStorage.setItem('profileData', JSON.stringify(initialData)); // Save initial data
    }
    setIsLoading(false); // Finish loading
  }, [toast]); // Added toast to dependency array

  // Handle input changes during editing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTempProfileData(prev => ({
        ...prev,
        // Convert age, height, weight to numbers, default to 0 if invalid
        [name]: (name === 'age' || name === 'height' || name === 'weight') ? (parseInt(value, 10) || 0) : value
    }));
  };

  // Handle fitness goal selection change
  const handleGoalChange = (value: string) => {
    // Ensure value is one of the allowed types
    if (value === 'Lose Weight' || value === 'Gain Weight' || value === 'Maintain') {
        setTempProfileData(prev => ({ ...prev, fitnessGoal: value as ProfileData['fitnessGoal'] }));
    }
  };

  // Save the changes made in the temporary state
  const handleSave = () => {
    setProfileData({ ...tempProfileData });
    localStorage.setItem('profileData', JSON.stringify(tempProfileData)); // Save updated data to localStorage
    setIsEditing(false);
    toast({
        title: "Profile Updated",
        description: "Your profile information has been saved.",
    });
  };

  // Discard changes and exit editing mode
  const handleCancel = () => {
    setTempProfileData({ ...profileData }); // Reset temp data to original
    setIsEditing(false);
  };

  if (isLoading) {
      return (
           <div className="flex flex-col items-center justify-center min-h-screen py-2">
             <p>Loading profile...</p>
           </div>
      );
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen py-6 px-4">
      <div className="flex items-center justify-between p-4 w-full max-w-md mb-4">
        <h1 className="text-2xl font-semibold">Profile</h1>
         <Button variant="secondary" onClick={() => router.push('/home')}>Back to Home</Button>
      </div>
      <Card className="w-full max-w-md shadow-md rounded-lg">
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              {/* Edit Form Fields */}
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={tempProfileData.name}
                  onChange={handleInputChange}
                  placeholder="Your Name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  type="number"
                  id="age"
                  name="age"
                  value={tempProfileData.age === 0 ? '' : tempProfileData.age} // Show empty if 0
                  onChange={handleInputChange}
                  placeholder="Your Age"
                  min="0"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  type="number"
                  id="height"
                  name="height"
                  value={tempProfileData.height === 0 ? '' : tempProfileData.height} // Show empty if 0
                  onChange={handleInputChange}
                  placeholder="Your Height"
                   min="0"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  type="number"
                  id="weight"
                  name="weight"
                  value={tempProfileData.weight === 0 ? '' : tempProfileData.weight} // Show empty if 0
                  onChange={handleInputChange}
                  placeholder="Your Weight"
                  min="0"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={tempProfileData.email}
                  onChange={handleInputChange}
                  placeholder="Your Email"
                  className="mt-1"
                  // Consider making email read-only if it's tied to authentication
                  // readOnly
                />
              </div>
              <div>
                <Label htmlFor="fitnessGoal">Fitness Goal</Label>
                 <Select name="fitnessGoal" value={tempProfileData.fitnessGoal} onValueChange={handleGoalChange}>
                  <SelectTrigger id="fitnessGoal" className="w-full mt-1">
                    <SelectValue placeholder="Select your goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lose Weight">Lose Weight</SelectItem>
                    <SelectItem value="Gain Weight">Gain Weight</SelectItem>
                    <SelectItem value="Maintain">Maintain</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
                <Button onClick={handleSave}>Save Changes</Button>
              </div>
            </>
          ) : (
            <>
              {/* Display Profile Information */}
              <p><span className="font-semibold">Name:</span> {profileData.name || 'Not set'}</p>
              <p><span className="font-semibold">Age:</span> {profileData.age > 0 ? profileData.age : 'Not set'}</p>
              <p><span className="font-semibold">Height:</span> {profileData.height > 0 ? `${profileData.height} cm` : 'Not set'}</p>
              <p><span className="font-semibold">Weight:</span> {profileData.weight > 0 ? `${profileData.weight} kg` : 'Not set'}</p>
              <p><span className="font-semibold">Email:</span> {profileData.email || 'Not set'}</p>
              <p><span className="font-semibold">Fitness Goal:</span> {profileData.fitnessGoal}</p>
              <div className="flex justify-between items-center pt-4">
                 <ModeToggle />
                 <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
