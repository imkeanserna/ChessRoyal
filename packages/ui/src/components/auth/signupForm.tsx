"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
import Link from "next/link";
import { Button } from "@repo/ui/components/ui/button";
import { useForm } from "react-hook-form";
import { SignUpSchema, SignUpType } from "@repo/ui/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Dispatch, FC, SetStateAction, useState } from "react";
import FormError from "./formError";
import { FaChessQueen } from "react-icons/fa";
import { SocialMediaButtons } from "./social-media";

interface SignUpFormProps {
  onSubmitAction: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<{ error: string }>;
  setActiveView: Dispatch<SetStateAction<"login" | "signup">>;
  handleShowAlert: () => void;
}

export const SignUpForm: FC<SignUpFormProps> = ({ onSubmitAction, setActiveView, handleShowAlert }) => {
  const [errorMessage, setErrorMessage] = useState<string>();

  const onSubmit = async (data: SignUpType) => {
    setErrorMessage("");
    try {
      const result = await onSubmitAction(data.email, data.password, data.displayName);
      if (result?.error) {
        setErrorMessage(result.error);
      } else {
        setActiveView('login');
        handleShowAlert();
      }
    } catch (_err) {
      setErrorMessage("Something went wrong");
    }
  };

  const form = useForm<SignUpType>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      email: "",
      password: "",
      displayName: "",
    },
  });

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardContent className="p-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              name="displayName"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-amber-100">Display Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="eg: Kean"
                      className="bg-neutral-800/50 border-amber-800/50 text-amber-100 placeholder:text-neutral-500 py-6 focus:border-amber-700 focus:ring-amber-700/50"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

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
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <FaChessQueen className="mr-2 h-4 w-4" />
                  Sign up
                </span>
              )}
            </Button>

            <div className="flex justify-center items-center text-amber-500/60 py-2">
              or
            </div>

            <SocialMediaButtons />

            <div className="text-center text-sm text-neutral-400">
              Already have an account?{" "}
              <Button
                variant="link"
                className="p-0 h-auto font-semibold text-amber-400 hover:text-amber-300 hover:no-underline"
                onClick={() => setActiveView('login')}
              >
                Sign in
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
