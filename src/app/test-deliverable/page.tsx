'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

export default function TestDeliverablePage() {
  const [itemConfirmed, setItemConfirmed] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  const handleConfirmItem = () => {
    console.log('🔵 Confirming item...');
    setItemConfirmed(true);
    console.log('✅ Item confirmed!');
  };

  const handleConfirmPayment = () => {
    console.log('🔵 Confirming payment...');
    setPaymentConfirmed(true);
    console.log('✅ Payment confirmed!');
  };

  const allConfirmed = itemConfirmed && paymentConfirmed;

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 to-neutral-950 p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-2xl font-bold text-white">
          Test Deliverable Confirmation
        </h1>

        <div className="space-y-6">
          {/* Item Deliverable */}
          <div className="rounded-lg border border-orange-500/30 bg-black/40 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-white">
                  Item Deliverable
                </h3>
                <p className="text-sm text-neutral-400">iPhone 15 Pro</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span
                    className={`rounded px-2 py-1 text-xs ${
                      itemConfirmed
                        ? 'border border-green-500/30 bg-green-500/20 text-green-300'
                        : 'border border-orange-500/30 bg-orange-500/20 text-orange-300'
                    }`}
                  >
                    {itemConfirmed ? 'Confirmed' : 'Pending'}
                  </span>
                </div>
                {!itemConfirmed && (
                  <Button
                    onClick={handleConfirmItem}
                    size="sm"
                    className="bg-green-600 text-white hover:bg-green-700"
                  >
                    <CheckCircle2 className="mr-1 h-4 w-4" />
                    Confirm
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Payment Deliverable */}
          <div className="rounded-lg border border-green-500/30 bg-black/40 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-white">
                  Payment Deliverable
                </h3>
                <p className="text-sm text-neutral-400">₱45,000</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span
                    className={`rounded px-2 py-1 text-xs ${
                      paymentConfirmed
                        ? 'border border-green-500/30 bg-green-500/20 text-green-300'
                        : 'border border-orange-500/30 bg-orange-500/20 text-orange-300'
                    }`}
                  >
                    {paymentConfirmed ? 'Confirmed' : 'Pending'}
                  </span>
                </div>
                {!paymentConfirmed && (
                  <Button
                    onClick={handleConfirmPayment}
                    size="sm"
                    className="bg-green-600 text-white hover:bg-green-700"
                  >
                    <CheckCircle2 className="mr-1 h-4 w-4" />
                    Confirm
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Transaction Confirmation */}
          <div className="rounded-lg border border-blue-500/30 bg-black/40 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-white">
                  Transaction Confirmation
                </h3>
                <p className="text-sm text-neutral-400">
                  {allConfirmed
                    ? 'All deliverables confirmed. Ready to finalize transaction.'
                    : 'Confirm all deliverables before proceeding'}
                </p>
              </div>
              <Button
                disabled={!allConfirmed}
                className={`${
                  allConfirmed
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'cursor-not-allowed bg-gray-600 text-gray-400'
                }`}
                size="sm"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {allConfirmed
                  ? 'Confirm Transaction'
                  : 'Complete Deliverables First'}
              </Button>
            </div>
          </div>

          {/* Status Summary */}
          <div className="rounded-lg bg-black/40 p-6">
            <h3 className="mb-4 text-lg font-medium text-white">
              Status Summary
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-300">Item Confirmed:</span>
                <span
                  className={
                    itemConfirmed ? 'text-green-400' : 'text-orange-400'
                  }
                >
                  {itemConfirmed ? '✅ Yes' : '❌ No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-300">Payment Confirmed:</span>
                <span
                  className={
                    paymentConfirmed ? 'text-green-400' : 'text-orange-400'
                  }
                >
                  {paymentConfirmed ? '✅ Yes' : '❌ No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-300">All Confirmed:</span>
                <span
                  className={
                    allConfirmed ? 'text-green-400' : 'text-orange-400'
                  }
                >
                  {allConfirmed ? '✅ Yes' : '❌ No'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
