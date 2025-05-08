
'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Dummy data for billing history
const dummyBillingHistory = [
  { id: 'INV-2024-003', date: '2024-07-15', amount: '$9.99', status: 'Paid', description: 'BalanceBot Premium - July' },
  { id: 'INV-2024-002', date: '2024-06-15', amount: '$9.99', status: 'Paid', description: 'BalanceBot Premium - June' },
  { id: 'INV-2024-001', date: '2024-05-15', amount: '$9.99', status: 'Paid', description: 'BalanceBot Premium - May' },
  // Add more entries as needed
];

const BillingHistoryPage = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-start min-h-screen py-6 px-4">
      <div className="flex items-center justify-between p-4 w-full max-w-3xl mb-4">
        <h1 className="text-2xl font-semibold">Billing History</h1>
        <Button variant="secondary" onClick={() => router.push('/settings')}>Back to Settings</Button>
      </div>
      <Card className="w-full max-w-3xl shadow-md rounded-lg">
        <CardHeader>
          <CardTitle>Your Past Invoices</CardTitle>
          <CardDescription>Review your subscription payments and download invoices.</CardDescription>
        </CardHeader>
        <CardContent>
          {dummyBillingHistory.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">You have no billing history yet.</p>
          ) : (
            <ScrollArea className="h-[400px] w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dummyBillingHistory.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.id}</TableCell>
                      <TableCell>{invoice.date}</TableCell>
                      <TableCell>{invoice.amount}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          invoice.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {invoice.status}
                        </span>
                      </TableCell>
                      <TableCell>{invoice.description}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">Download PDF</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingHistoryPage;
