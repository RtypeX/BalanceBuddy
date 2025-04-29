'use client';

import { getFirebase } from '@/lib/firebaseClient';
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Profile: React.FC = () => {
  const [profileData, setProfileData] = useState<any>({
    name: 'Demo User',
    age: 30,
    height: 175,
    weight: 70,
    email: 'demo@example.com',
  });

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">User Profile</h2>
      <Card>
        <CardHeader>
          <CardTitle>{profileData.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Age: {profileData.age}</p>
          <p>Height: {profileData.height} cm</p>
          <p>Weight: {profileData.weight} kg</p>
          <p>Email: {profileData.email}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
