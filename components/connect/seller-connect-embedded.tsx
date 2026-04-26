"use client";

import { useEffect, useState } from "react";
import { loadConnectAndInitialize } from "@stripe/connect-js/pure";
import {
  ConnectBalances,
  ConnectComponentsProvider,
  ConnectNotificationBanner,
  ConnectPayments,
  ConnectPayouts,
} from "@stripe/react-connect-js";
import { Loader2 } from "lucide-react";

type StripeConnectInstance = ReturnType<typeof loadConnectAndInitialize>;

export function SellerConnectEmbedded() {
  const [connectInstance, setConnectInstance] =
    useState<StripeConnectInstance | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      setError("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set.");
      return;
    }

    try {
      const instance = loadConnectAndInitialize({
        publishableKey,
        fetchClientSecret: async () => {
          const res = await fetch("/api/stripe-connect/account-session", {
            method: "POST",
            credentials: "same-origin",
            cache: "no-store",
          });
          const data = (await res.json()) as {
            client_secret?: string;
            error?: string;
          };
          if (!res.ok) {
            throw new Error(data.error ?? "Could not create account session");
          }
          if (!data.client_secret) {
            throw new Error("Missing client_secret from Stripe");
          }
          return data.client_secret;
        },
      });
      setConnectInstance(instance);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connect failed to initialize");
    }
  }, []);

  if (error) {
    return (
      <p className="text-sm text-red-600 px-4 py-6 text-center" role="alert">
        {error}
      </p>
    );
  }

  if (!connectInstance) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <ConnectComponentsProvider connectInstance={connectInstance}>
      <div className="space-y-6 p-4 sm:p-6">
        <ConnectNotificationBanner />
        <ConnectBalances />
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Payments &amp; transfers
          </h3>
          <ConnectPayments />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Payouts</h3>
          <ConnectPayouts />
        </div>
      </div>
    </ConnectComponentsProvider>
  );
}
