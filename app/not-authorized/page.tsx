"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaLocationPinLock } from "react-icons/fa6";

  export default function NotAuthorizedPage() {
    const router = useRouter();

    const handleGoBack = () => {
      // Check if there's a previous page in history
      if (window.history.length > 1) {
        router.back();
      } else {
        // Fallback to home if no previous page
        router.push('/');
      }
    };
    return (
      <div className="flex justify-center h-[calc(100vh-365px)] items-center">
          <div className="text-center py-12 px-4 w-full">
            <div className="mb-4">
              <FaLocationPinLock className="h-12 w-12 mx-auto text-gray-400" />
            </div>
            <h3 className="text-2xl font-medium text-gray-900 mb-4">Not Authorized</h3>
              <div> 
              <p className="text-gray-600">You currently do not have access to view this page</p>
              <p className="text-gray-600 mb-4">The content has either been removed or you do not have access to view it.</p>
              <div className="flex justify-center mt-4 gap-4">
                <Button 
                  variant="outline" 
                  onClick={handleGoBack}
                >
                  Go Back
                </Button>
                <Link href="/">
                  <Button variant="outline">
                    Go Home
                  </Button>
                </Link>
              </div>
              </div>
          </div>
        </div>
    );
  }
  