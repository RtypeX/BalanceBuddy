'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ModeToggle";

const ProfilePage = () => {
  const [profileData, setProfileData] = useState<any>({
    name: 'Demo User',
    age: 30,
    height: 175,
    weight: 70,
    email: 'demo@example.com',
    fitnessGoal: 'Lose Weight',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempProfileData, setTempProfileData] = useState({ ...profileData });

  useEffect(() => {
    // Load profile data from local storage on component mount
    const storedProfileData = localStorage.getItem('profileData');
    if (storedProfileData) {
      setProfileData(JSON.parse(storedProfileData));
      setTempProfileData(JSON.parse(storedProfileData));
    }
  }, []);

  useEffect(() => {
    // Save profile data to local storage whenever profileData changes
    localStorage.setItem('profileData', JSON.stringify(profileData));
  }, [profileData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTempProfileData({ ...tempProfileData, [name]: value });
  };

  const handleSave = () => {
    setProfileData({ ...tempProfileData });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempProfileData({ ...profileData });
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <div className="flex items-center justify-between p-4 w-full max-w-md">
        <h1 className="text-2xl font-semibold">Profile</h1>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={tempProfileData.name}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  type="number"
                  id="age"
                  name="age"
                  value={tempProfileData.age}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  type="number"
                  id="height"
                  name="height"
                  value={tempProfileData.height}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  type="number"
                  id="weight"
                  name="weight"
                  value={tempProfileData.weight}
                  onChange={handleInputChange}
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
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="fitnessGoal">Fitness Goal</Label>
                <select
                  id="fitnessGoal"
                  name="fitnessGoal"
                  value={tempProfileData.fitnessGoal}
                  onChange={handleInputChange}
                  className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="Lose Weight">Lose Weight</option>
                  <option value="Gain Weight">Gain Weight</option>
                  <option value="Maintain">Maintain</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
                <Button onClick={handleSave}>Save</Button>
              </div>
            </>
          ) : (
            <>
              <p>Name: {profileData.name}</p>
              <p>Age: {profileData.age}</p>
              <p>Height: {profileData.height} cm</p>
              <p>Weight: {profileData.weight} kg</p>
              <p>Email: {profileData.email}</p>
              <p>Fitness Goal: {profileData.fitnessGoal}</p>
              <div className="flex justify-end">
                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
              </div>
              <ModeToggle />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
