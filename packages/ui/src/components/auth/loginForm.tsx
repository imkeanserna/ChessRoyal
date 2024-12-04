"use client";

import {
  Card,
  CardContent,
} from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input"
import { Button } from "@repo/ui/components/ui/button";
import { useForm } from "react-hook-form";
import { LoginSchema, LoginType } from "@repo/ui/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import FormError from "./formError";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { FaChessKing } from "react-icons/fa";
import { SocialMediaButtons } from "./social-media";
import { useRouter } from 'next/navigation';

interface LoginFormProps {
  onSuccess?: () => void;
  setActiveView: Dispatch<SetStateAction<"login" | "signup">>;
}

export const LoginForm: FC<LoginFormProps> = ({ onSuccess, setActiveView }) => {
  const [errorMessage, setErrorMessage] = useState<string>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const onSubmit = async (data: LoginType) => {
    setErrorMessage("");
    const result = await signIn("credentials", {
      ...data,
      redirect: false,
      callbackUrl: "/",
    });

    if (result?.error) {
      setErrorMessage("Invalid credentials");
    } else {
      onSuccess && onSuccess();
      router.push("/");
    }
  };

  const form = useForm<LoginType>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    const error = searchParams.get("error");

    if (error == "CredentialsSignin") {
      setErrorMessage("Invalid credentials");
    } else if (error != null) {
      setErrorMessage("Something went wrong");
    }
  }, [searchParams]);

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardContent className="p-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-amber-100">Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="name@example.com"
                      className="bg-neutral-800/50 border-amber-800/50 text-amber-100 placeholder:text-neutral-500 py-6 focus:border-amber-700 focus:ring-amber-700/50"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-amber-100">Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      className="bg-neutral-800/50 border-amber-800/50 text-amber-100 placeholder:text-neutral-500 py-6 focus:border-amber-700 focus:ring-amber-700/50"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            <FormError errorMessage={errorMessage} />
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-amber-100 border-none transition-all duration-200"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <span className="flex items-center justify-center gap-x-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Moving pieces...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <FaChessKing className="mr-2 h-4 w-4" />
                  Sign in
                </span>
              )}
            </Button>
            <div className="flex justify-center items-center text-amber-500/60 py-2">
              or
            </div>
            <SocialMediaButtons />
            <div className="text-center text-sm text-neutral-400">
              New to Chess Arena?{" "}
              <Button
                variant="link"
                className="p-0 h-auto font-semibold text-amber-400 hover:text-amber-300 hover:no-underline"
                onClick={() => setActiveView('signup')}
              >
                Create an account
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
