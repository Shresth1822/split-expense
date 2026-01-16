import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const updatePasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type UpdatePasswordForm = z.infer<typeof updatePasswordSchema>;

export function UpdatePassword() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  // Check if we have a session (user clicked the magic link)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setHasSession(true);
      } else {
        // If no session, it might be expired or not loaded yet.
        // We can listen for auth state change or just show error.
        // Usually clicking the link sets the session immediately.
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setHasSession(true);
      }
      if (session) {
        setHasSession(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdatePasswordForm>({
    resolver: zodResolver(updatePasswordSchema),
  });

  const onSubmit = async (data: UpdatePasswordForm) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) throw error;

      toast.success("Password updated successfully!");
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen lg:grid lg:grid-cols-2">
      {/* Left Side - Hero/Branding */}
      <div className="hidden lg:flex flex-col justify-between p-10 bg-zinc-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-black z-0" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent z-0" />

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
            Secure your account.
          </h1>
          <p className="text-lg text-zinc-400">
            Set a new, strong password to keep your expenses and data safe.
          </p>
        </div>

        <div className="relative z-10 text-sm text-zinc-500">
          &copy; 2025 Splitify. All rights reserved.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Set New Password</h1>
            <p className="text-balance text-muted-foreground">
              Enter your new password below
            </p>
          </div>

          {!hasSession ? (
            <div className="rounded-md bg-yellow-500/15 p-4 text-sm text-yellow-600 font-medium border border-yellow-500/20 text-center">
              Invalid or expired link. Please request a new password reset.
              <Button
                asChild
                variant="link"
                className="mt-2 text-yellow-700 underline"
              >
                <Link to="/forgot-password">Go to Forgot Password</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
              {error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
