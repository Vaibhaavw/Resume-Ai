import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useRequestPasswordReset } from "@workspace/api-client-react";
import { Sparkles, ArrowLeft } from "lucide-react";
import { useState } from "react";

const schema = z.object({
  email: z.string().email("Invalid email address"),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPassword() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const resetMutation = useRequestPasswordReset();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = (data: FormData) => {
    resetMutation.mutate({ data }, {
      onSuccess: () => setSubmitted(true),
      onError: () => setSubmitted(true), // Always show success to prevent enumeration
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg">ResumeAI</span>
        </div>

        {submitted ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-3">Check your email</h2>
            <p className="text-muted-foreground mb-6">
              If an account exists with that email, we've sent a password reset link.
            </p>
            <Link href="/login">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-2">Forgot password?</h1>
            <p className="text-muted-foreground mb-8">
              Enter your email and we'll send you a link to reset your password.
            </p>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" {...field} data-testid="input-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full h-11" disabled={resetMutation.isPending} data-testid="button-submit">
                  {resetMutation.isPending ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            </Form>

            <div className="text-center mt-6">
              <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" />
                Back to login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
