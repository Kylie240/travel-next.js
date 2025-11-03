export default function ConfirmEmailPage() {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <h1 className="text-2xl font-semibold mb-4">Check your inbox</h1>
        <p className="text-gray-600 max-w-md">
          We’ve sent a confirmation link to your email.  
          Please click it to activate your account before signing in.
        </p>
      </div>
    );
  }
  