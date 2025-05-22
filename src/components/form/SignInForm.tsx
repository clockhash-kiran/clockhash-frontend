"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import React, { useState } from "react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import GitHubSignInButton from "../GitHubSignInButton";
import GoogleSignInButton from "../GoogleSignInButton";
import { Loader2 } from "lucide-react";

// Define validation schema using Zod
const formSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(8, "Password must have at least 8 characters"),
});

// Utility function for session storage handling
const handleSessionStorage = (
  action: "set" | "clear",
  email?: string,
  password?: string
) => {
  if (action === "set" && email && password) {
    sessionStorage.setItem("email", email);
    sessionStorage.setItem("password", password);
  } else if (action === "clear") {
    sessionStorage.removeItem("email");
    sessionStorage.removeItem("password");
  }
};

const SignInForm = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Initialize react-hook-form with validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);

    try {
      // Attempt to sign in using credentials
      const signInData = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (signInData?.error) {
        toast.error(signInData.error);
        setLoading(false);
        return;
      }

      // Check if MFA is enabled for the user
      const response = await fetch("/api/auth/mfa-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      });

      if (!response.ok) throw new Error("Failed to check MFA status");

      const { id, mfaEnabled, mfaCompleted } = await response.json();

      if (mfaEnabled && !mfaCompleted) {
        handleSessionStorage("set", values.email, values.password);
        toast.info("MFA required. Redirecting...");
        await router.push(`/verify-mfa?id=${encodeURIComponent(id)}`);
      } else {
        handleSessionStorage("clear");
        toast.success("Login successful! Redirecting...");
        await router.push("/");
        router.refresh(); // Refresh page after login
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <h2 className="text-xl font-bold text-center">Sign In</h2>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Input Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Input Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Sign In Button with Loader */}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : "Sign In"}
              </Button>
            </form>
          </Form>

          {/* Divider with "or" */}
          <div className="relative my-4 flex items-center">
            <div className="flex-grow border-t"></div>
            <span className="mx-2 text-sm text-gray-500">or</span>
            <div className="flex-grow border-t"></div>
          </div>

          {/* OAuth Sign-In Buttons */}
          <div className="flex justify-center space-x-4">
            <div
              onClick={() => signIn("github", { callbackUrl: "/" })}
              className="p-2 rounded-full cursor-pointer hover:opacity-80"
            >
              <GitHubSignInButton />
            </div>

            <div
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="p-2 rounded-full cursor-pointer hover:opacity-80"
            >
              <GoogleSignInButton />
            </div>
          </div>
        </CardContent>

        {/* Footer with Sign Up Link */}
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?&nbsp;
            <Link href="/sign-up" className="text-blue-500 hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignInForm;
