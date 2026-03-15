"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  DollarSign,
  Clock,
  Receipt,
  TrendingUp,
  Loader2,
  FileText,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getSellerTransactions,
  SellerTransactionRow,
  SellerDashboardData,
} from "@/lib/actions/seller.actions";
import createClient from "@/utils/supabase/client";

function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function PayoutStatusBadge({ status }: { status: string }) {
  const variant =
    status === "paid"
      ? "default"
      : status === "pending"
        ? "secondary"
        : "outline";
  const label =
    status === "paid" ? "Paid" : status === "pending" ? "Pending" : status;
  return <Badge variant={variant}>{label}</Badge>;
}

export default function SellerDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [data, setData] = useState<SellerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const load = async () => {
      const {
        data: { user: u },
      } = await supabase.auth.getUser();
      if (!u) {
        router.replace("/login?redirect=/seller-dashboard");
        setLoading(false);
        return;
      }
      setUser(u);
      const result = await getSellerTransactions();
      setData(result ?? null);
      setLoading(false);
    };

    load();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    );
  }

  if (!user) return null;

  const transactions = data?.transactions ?? [];
  const hasTransactions = transactions.length > 0;

  return (
    <div className="min-h-screen bg-gray-50/80 py-8 sm:pt-[4rem]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            Seller Dashboard
          </h1>
          <p className="mt-1 text-gray-600">
            Earnings and sales from your itineraries
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-100 p-2.5">
                  <DollarSign className="h-5 w-5 text-emerald-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total earnings
                  </p>
                  <p className="text-xl font-semibold text-gray-900">
                    {formatCents(data?.totalEarningsCents ?? 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-amber-100 p-2.5">
                  <Clock className="h-5 w-5 text-amber-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Pending payout
                  </p>
                  <p className="text-xl font-semibold text-gray-900">
                    {formatCents(data?.totalPendingCents ?? 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-slate-100 p-2.5">
                  <Receipt className="h-5 w-5 text-slate-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Sales</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {data?.transactionCount ?? 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions list */}
        <Card>
          <CardContent className="p-0">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-medium text-gray-900">
                Transaction history
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Sales of your paid itineraries
              </p>
            </div>

            {!hasTransactions ? (
              <div className="py-16 px-4 text-center">
                <TrendingUp className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No sales yet
                </h3>
                <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                  When someone purchases one of your paid itineraries, the sale
                  will appear here.
                </p>
                <Link
                  href="/my-itineraries"
                  className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                >
                  <FileText className="h-4 w-4" />
                  My itineraries
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100 bg-gray-50/50">
                      <th className="py-3 px-4 font-medium">Date</th>
                      <th className="py-3 px-4 font-medium">Itinerary</th>
                      <th className="py-3 px-4 font-medium text-right">
                        Gross
                      </th>
                      <th className="py-3 px-4 font-medium text-right hidden sm:table-cell">
                        Fees
                      </th>
                      <th className="py-3 px-4 font-medium text-right">
                        Earnings
                      </th>
                      <th className="py-3 px-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions.map((t) => (
                      <TransactionRow key={t.id} transaction={t} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TransactionRow({ transaction }: { transaction: SellerTransactionRow }) {
  const title =
    transaction.itineraries?.title ?? "Itinerary";
  const itineraryId = transaction.itinerary_id;
  const fees =
    (transaction.platform_fee_cents ?? 0) +
    (transaction.stripe_fee_cents ?? 0);

  return (
    <tr className="hover:bg-gray-50/50">
      <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">
        {formatDate(transaction.created_at)}
      </td>
      <td className="py-3 px-4">
        <Link
          href={`/itinerary/${itineraryId}`}
          className="text-sm font-medium text-gray-900 hover:text-gray-700 inline-flex items-center gap-1"
        >
          <span className="max-w-[140px] sm:max-w-[200px] truncate block">
            {title}
          </span>
          <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
        </Link>
      </td>
      <td className="py-3 px-4 text-sm text-gray-600 text-right whitespace-nowrap">
        {formatCents(transaction.gross_amount_cents)}
      </td>
      <td className="py-3 px-4 text-sm text-gray-500 text-right whitespace-nowrap hidden sm:table-cell">
        −{formatCents(fees)}
      </td>
      <td className="py-3 px-4 text-sm font-medium text-gray-900 text-right whitespace-nowrap">
        {formatCents(transaction.seller_earnings_cents)}
      </td>
      <td className="py-3 px-4">
        <PayoutStatusBadge status={transaction.payout_status} />
      </td>
    </tr>
  );
}
