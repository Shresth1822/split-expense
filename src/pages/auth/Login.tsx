import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginForm = z.infer<typeof loginSchema>;

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // Resend logic for Login page
  const [resendCooldown, setResendCooldown] = useState(0);

  const {
    register,
    handleSubmit,
    getValues, // Login form needs getValues for email
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

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

      // Optional: Show success feedback?
      // For now, if no error, we assume sent.
      // Could clear error or show toast.
    } catch (err: any) {
      setError(err.message);
    }
  };

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen lg:grid lg:grid-cols-2">
      {/* Left Side - Hero/Branding */}
      <div className="hidden lg:flex flex-col justify-between p-10 bg-zinc-900 text-white relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-black z-0" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent z-0" />

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
            Managing shared expenses has never been easier.
          </h1>
          <p className="text-lg text-zinc-400">
            Join thousands of users who trust Splitify to keep track of bills,
            splits, and IOUs with friends and family.
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
          </div>

          <div className="grid gap-2 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome back
            </h1>
            <p className="text-balance text-muted-foreground text-sm sm:text-base">
              Enter your email below to login to your account
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            {/* ... form content ... */}
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive font-medium border border-destructive/20">
                {error}
                {(error.includes("Email not confirmed") ||
                  error.includes("Invalid login credentials")) && (
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto font-semibold text-destructive underline ml-1 align-baseline"
                    onClick={handleResendVerification}
                    disabled={resendCooldown > 0}
                  >
                    {resendCooldown > 0
                      ? `Wait ${resendCooldown}s`
                      : "Unverified? Resend Email"}
                  </Button>
                )}
              </div>
            )}
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
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="ml-auto inline-block text-xs text-primary hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
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
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              state={{ from: location.state?.from }}
              className="underline text-primary hover:text-primary/90 font-medium"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
