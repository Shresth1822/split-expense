import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterForm = z.infer<typeof registerSchema>;

export function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  // If verifying email, user might be redirected here from email link,
  // but standard signup flow -> user is created -> maybe auto signed in?
  // Supabase default is auto sign in if email confirm is disabled.
  // If enabled, they can't sign in yet.
  // Assuming they can sign in or are signed in:
  const from = location.state?.from?.pathname || "/";
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    getValues, // Extract getValues here
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  // Removed useless if (isLoading) block

  // Show Verification Success Message
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleResendVerification = async () => {
    const email = getValues().email;
    if (!email) return;

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      });
      if (error) throw error;

      // Start cooldown
      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            currency: "INR",
          },
        },
      });

      if (error) throw error;

      if (authData.session) {
        // Auto-confirmed (e.g. dev mode or specific settings)
        navigate(from, { replace: true });
      } else {
        // Email verification required
        setNeedsVerification(true);
      }
    } catch (err: any) {
      if (err.message.includes("already registered")) {
        setError(
          "This email is already registered. If you haven't verified it yet, you can resend the verification email.",
        );
        // We can't automatically trigger resend here without user action for security/UX,
        // but we can show the verification screen or a specific button if we wanted.
        // For now, let's keep it simple: if they try to sign up and fail, they can't "resend" from the form easily unless we change state.
        // Better UX: Allow them to proceed to validation screen to resend.
        // Let's set needsVerification to true but show a different message?
        // Actually, if they are already registered, signUp might not return a session but might throws error.
        // Let's allow them to reach the verification screen to hit "Resend".
        // changing strategy slightly: if "already registered", user might be unverified.
      }
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (needsVerification) {
    return (
      <div className="w-full h-screen flex items-center justify-center p-4 bg-background">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 text-primary"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>
            </div>
            <CardTitle className="text-2xl">Verify your email</CardTitle>
            <CardDescription>
              We've sent a verification link to{" "}
              <span className="font-medium text-foreground">
                {getValues().email}
              </span>
              .
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please check your inbox (and spam folder) and click the link to
              activate your account.
            </p>

            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                onClick={handleResendVerification}
                disabled={resendCooldown > 0}
                className="w-full"
              >
                {resendCooldown > 0
                  ? `Resend available in ${resendCooldown}s`
                  : "Resend Verification Email"}
              </Button>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() =>
                  navigate("/login", { state: { from: location.state?.from } })
                }
              >
                Return to Login
              </Button>
            </div>

            {error && <p className="text-sm text-destructive mt-2">{error}</p>}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full h-screen lg:grid lg:grid-cols-2">
      {/* Left Side - Hero/Branding */}
      <div className="hidden lg:flex flex-col justify-between p-10 bg-zinc-900 text-white relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-black z-0" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent z-0" />

        {/* Content */}
        <div className="relative z-10 flex items-center gap-2">
          <img
            src="/splitify-logo.png"
            alt="Splitify Logo"
            className="h-10 w-10 object-contain"
          />
          <span className="text-xl font-bold">Splitify</span>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Start splitting bills the smart way.
          </h1>
          <p className="text-lg text-zinc-400">
            Create an account to track detailed expenses, manage groups, and
            settle debts effortlessly.
          </p>
        </div>

        <div className="relative z-10 text-sm text-zinc-500">
          &copy; 2025 Splitify. All rights reserved.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
        {/* Mobile Background Elements */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 h-64 w-64 rounded-full bg-primary/5 blur-3xl lg:hidden"></div>
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 h-64 w-64 rounded-full bg-indigo-500/5 blur-3xl lg:hidden"></div>

        <div className="mx-auto grid w-[350px] gap-6 relative z-10">
          {/* Mobile Branding */}
          <div className="flex flex-col items-center gap-2 mb-2 lg:hidden">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-lg shadow-primary/20">
              <img
                src="/splitify-logo.png"
                alt="Logo"
                className="h-8 w-8 object-contain"
              />
            </div>
            <span className="text-xl font-bold tracking-tight">Splitify</span>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto text-center">
              Start splitting bills the smart way. Track expenses and settle
              debts from the palm of your hand.
            </p>
          </div>

          <div className="grid gap-2 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Create an account
            </h1>
            <p className="text-balance text-muted-foreground text-sm sm:text-base">
              Enter your information to get started
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive font-medium border border-destructive/20">
                {error}
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="John Doe"
                {...register("fullName")}
                className="bg-card w-full"
              />
              {errors.fullName && (
                <p className="text-xs text-destructive font-medium">
                  {errors.fullName.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                {...register("email")}
                className="bg-card w-full"
              />
              {errors.email && (
                <p className="text-xs text-destructive font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                className="bg-card w-full"
              />
              {errors.password && (
                <p className="text-xs text-destructive font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 transition-all duration-300 shadow-md shadow-primary/20"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              state={{ from: location.state?.from }}
              className="underline text-primary hover:text-primary/90 font-medium"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
