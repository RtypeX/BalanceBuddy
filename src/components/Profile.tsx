'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { collection, doc, getDoc, getDocs, where } from "firebase/firestore";
import { getFirebase } from "@/lib/firebaseClient";

const Profile: React.FC = () => {
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      const firebase = getFirebase();
      if (!firebase) {
        console.log("Firebase not initialized.");
        return;
      }
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userEmail = user.email;

      if (userEmail) {
        // Fetch user data from Firestore based on email
        const q = collection(firebase.db, "users");
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          querySnapshot.forEach((doc) => {
            if(doc.data().email === userEmail){
              setProfileData({id: doc.id, ...doc.data()});
            }
          });
        } else {
          console.log("No matching documents.");
          setProfileData(null);
        }
      }
    };

    fetchProfileData();
  }, []);

  if (!profileData) {
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-4">User Profile</h2>
        <p className="mb-4">No profile data available.</p>
      </div>
    );
  }

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
