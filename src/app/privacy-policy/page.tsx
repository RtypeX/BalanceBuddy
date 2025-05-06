
'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PrivacyPolicyPage = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-start min-h-screen py-6 px-4">
      <div className="flex items-center justify-between p-4 w-full max-w-3xl mb-4">
        <h1 className="text-2xl font-semibold">Privacy Policy</h1>
        <Button variant="secondary" onClick={() => router.back()}>Back</Button>
      </div>
      <Card className="w-full max-w-3xl shadow-md rounded-lg">
        <CardHeader>
          <CardTitle>BalanceBuddy Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>
          
          <p>Welcome to BalanceBuddy! Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.</p>

          <h2 className="text-lg font-semibold text-foreground pt-2">1. Information We Collect</h2>
          <p>We may collect information about you in a variety of ways. The information we may collect via the Application depends on the content and materials you use, and includes:</p>
          <ul className="list-disc list-inside pl-4 space-y-1">
            <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, age, height, weight, and fitness goals that you voluntarily give to us when you register with the Application or when you choose to participate in various activities related to the Application, such as online chat and message boards.</li>
            <li><strong>Usage Data:</strong> Information your browser sends whenever you visit our Service or when you access the Service by or through a mobile device. This Usage Data may include information such as your computer's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, unique device identifiers and other diagnostic data.</li>
            <li><strong>Data Stored Locally:</strong> To provide offline functionality and enhance performance, BalanceBuddy stores some of your data directly on your device using browser local storage. This includes your chat history, saved workouts, fasting logs, weight logs, nutrition logs, sleep logs, profile information, and application preferences (like theme and notification settings). This data is not automatically transmitted to our servers unless explicitly stated for a specific feature (which is not the case for the current demo version).</li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground pt-2">2. Use of Your Information</h2>
          <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Application to:</p>
          <ul className="list-disc list-inside pl-4 space-y-1">
            <li>Create and manage your account.</li>
            <li>Personalize and improve your experience with the Application.</li>
            <li>Provide you with customer support.</li>
            <li>Monitor and analyze usage and trends to improve your experience with the Application.</li>
            <li>Notify you about updates to the Application.</li>
            <li>Request feedback and contact you about your use of the Application.</li>
            <li>For other business purposes, such as data analysis, identifying usage trends, determining the effectiveness of our promotional campaigns, and to evaluate and improve our Application, products, services, marketing, and your experience. (Currently, all data is stored locally for demo purposes).</li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground pt-2">3. Disclosure of Your Information</h2>
          <p>We do not share, sell, rent, or trade your information with third parties for their commercial purposes. As this is a demo application, all your data (profile, logs, etc.) is stored locally on your device and is not transmitted to any external server by default.</p>
          
          <h2 className="text-lg font-semibold text-foreground pt-2">4. Security of Your Information</h2>
          <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse. Since data is stored locally in this demo, the security of this data also depends on the security of your device and browser.</p>

          <h2 className="text-lg font-semibold text-foreground pt-2">5. Policy for Children</h2>
          <p>We do not knowingly solicit information from or market to children under the age of 13. If you become aware of any data we have collected from children under age 13, please contact us using the contact information provided below.</p>
          
          <h2 className="text-lg font-semibold text-foreground pt-2">6. Changes to This Privacy Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>

          <h2 className="text-lg font-semibold text-foreground pt-2">7. Contact Us</h2>
          <p>If you have questions or comments about this Privacy Policy, please contact us at: [Your Contact Email/Link - e.g., support@balancebuddy.app - Placeholder]</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivacyPolicyPage;

    