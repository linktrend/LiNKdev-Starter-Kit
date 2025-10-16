import Link from 'next/link';

export default function Component() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/signin"
          className="rounded-md p-2 transition-colors hover:bg-muted"
          prefetch={false}
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Link>
        <div />
      </div>
      <div className="flex items-center justify-center flex-1">
        <div className="w-full max-w-md rounded-lg border border-border bg-card text-card-foreground shadow-sm">
          <div className="grid gap-4 px-4 pb-4 my-10">
            <div className="space-y-1 text-center">
              <h2 className="text-2xl font-bold">Forgot Password</h2>
              <p className="text-muted-foreground my-2">
                Enter your email to reset your password
              </p>
            </div>
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email</label>
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <button 
              type="submit" 
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
            >
              Reset Password
            </button>
            <div className="text-center text-sm text-muted-foreground">
              <span>Reset your password with your email</span>
            </div>
            <div className="flex justify-center">
              <Link
                href="/signin"
                className="text-sm font-medium hover:underline underline-offset-4"
                prefetch={false}
              >
                Remember your password? Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArrowLeftIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}
