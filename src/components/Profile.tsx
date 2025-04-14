import React from 'react';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

const Profile: React.FC = () => {
  const demoProfile = {
    name: 'John Doe',
    age: 30,
    height: '180 cm',
    weight: '75 kg',
    email: 'john.doe@example.com',
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">User Profile</h2>
      <p className="mb-4">Display user profile with basic information and workout statistics.</p>
      <Card>
        <CardHeader>
          <CardTitle>{demoProfile.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Age: {demoProfile.age}</p>
          <p>Height: {demoProfile.height}</p>
          <p>Weight: {demoProfile.weight}</p>
          <p>Email: {demoProfile.email}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
