import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { account, databases } from "@/lib/appwriteClient";

const Profile: React.FC = () => {
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // 1. Retrieve user data from localStorage
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user.id;

        if (!userId) {
          console.log("No user ID found in local storage.");
          setProfileData(null);
          return;
        }

        // 2. Fetch user profile from database using Appwrite
        const userProfile = await databases.getDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!,
          userId
        );

        if (!userProfile) {
          console.log("No matching user profile found in database.");
          setProfileData(null);
          return;
        }

        setProfileData(userProfile);
      } catch (error: any) {
        console.error("Failed to fetch profile data:", error.message);
        setProfileData(null);
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
