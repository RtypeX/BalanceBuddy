
'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TermsOfServicePage = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-start min-h-screen py-6 px-4">
      <div className="flex items-center justify-between p-4 w-full max-w-3xl mb-4">
        <h1 className="text-2xl font-semibold">Terms of Service</h1>
        <Button variant="secondary" onClick={() => router.back()}>Back</Button>
      </div>
      <Card className="w-full max-w-3xl shadow-md rounded-lg">
        <CardHeader>
          <CardTitle>BalanceBuddy Terms of Service</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>

          <p>Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the BalanceBuddy application (the "Service") operated by Us.</p>
          <p>Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service.</p>
          <p>By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.</p>

          <h2 className="text-lg font-semibold text-foreground pt-2">1. Accounts</h2>
          <p>When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
          <p>You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password, whether your password is with our Service or a third-party service.</p>
          <p>You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</p>
          
          <h2 className="text-lg font-semibold text-foreground pt-2">2. Use of the Service</h2>
          <p>BalanceBuddy is a fitness application designed for personal, non-commercial use. You agree not to use the Service for any illegal or unauthorized purpose.</p>
          <p>The Service provides fitness tracking, workout planning, and AI-powered advice. This information is for informational purposes only and is not intended as medical advice. Always consult with a qualified healthcare provider before starting any new fitness or nutrition program.</p>
          <p>As this is a demo application, features related to payments, subscriptions, and server-side data storage are simulated. All user-generated data (workouts, logs, profile information) is stored locally on your device.</p>

          <h2 className="text-lg font-semibold text-foreground pt-2">3. Intellectual Property</h2>
          <p>The Service and its original content (excluding Content provided by users), features, and functionality are and will remain the exclusive property of Us and its licensors. The Service is protected by copyright, trademark, and other laws of both the [Your Country - Placeholder] and foreign countries.</p>

          <h2 className="text-lg font-semibold text-foreground pt-2">4. Termination</h2>
          <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
          <p>Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, you may simply discontinue using the Service (and delete locally stored data from your browser if desired).</p>

          <h2 className="text-lg font-semibold text-foreground pt-2">5. Limitation Of Liability</h2>
          <p>In no event shall We, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage, and even if a remedy set forth herein is found to have failed of its essential purpose.</p>
          
          <h2 className="text-lg font-semibold text-foreground pt-2">6. Disclaimer</h2>
          <p>Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement or course of performance.</p>
          <p>We do not warrant that a) the Service will function uninterrupted, secure or available at any particular time or location; b) any errors or defects will be corrected; c) the Service is free of viruses or other harmful components; or d) the results of using the Service will meet your requirements.</p>
          
          <h2 className="text-lg font-semibold text-foreground pt-2">7. Governing Law</h2>
          <p>These Terms shall be governed and construed in accordance with the laws of [Your Jurisdiction - Placeholder], without regard to its conflict of law provisions.</p>
          
          <h2 className="text-lg font-semibold text-foreground pt-2">8. Changes</h2>
          <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
          <p>By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, please stop using the Service.</p>

          <h2 className="text-lg font-semibold text-foreground pt-2">9. Contact Us</h2>
          <p>If you have any questions about these Terms, please contact us at: [Your Contact Email/Link - e.g., support@balancebuddy.app - Placeholder]</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TermsOfServicePage;

    