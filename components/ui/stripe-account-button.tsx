import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function StripeAccountButton({
  label = "Connect Stripe",
  variant = "outline",
}: {
  label?: string
  variant?: "outline" | "default"
}) {
  const [loading, setLoading] = useState(false);

  const handleConnectStripe = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe-connect", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (!res.ok) {
        toast.error(data.error ?? "Could not start Stripe setup");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      toast.error("No onboarding URL returned");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      className={
        variant === "default"
          ? "bg-gray-900 text-white hover:bg-gray-800"
          : undefined
      }
      onClick={handleConnectStripe}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden />
      ) : null}
      {loading ? "Redirecting…" : label}
    </Button>
  );
}
