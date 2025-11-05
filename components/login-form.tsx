"use client"

import { useState } from "react"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { cn } from "@/lib/utils"
import { appConfigurations, HelpLinks } from "@/constants"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { EyeIcon, EyeOffIcon, Loader } from "lucide-react"
import { signInFormSchema } from "@/lib/zod-schema"
import { signIn } from "next-auth/react"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {

  // === Local states ===
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter();

  /* === React Hook Form Setup === */
  const form = useForm<z.infer<typeof signInFormSchema>>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  /* === Submit Handler === */
  async function onSubmit(values: z.infer<typeof signInFormSchema>) {
    try {
      setIsLoading(true)
      toast.loading("Logging in...", {
        id: "login-loading",
      })

      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
        callbackUrl: appConfigurations.loginURL,
      });

      // === Handle sign-in result ===
      if (result?.error) {
        if (result.error === 'CredentialsSignin') {
          toast.error("Oops! We couldn't log you in. Double-check your email and password.");

        } else {
          toast.error(`We're having trouble: ${result.error}. Check logs or try again.`);
        }
      } else if (result?.ok) {
        toast.success(`Successfully logged in. Welcome back!`);
        router.push(result.url || appConfigurations.loginURL);
        window.location.href = appConfigurations.loginURL;
      }

    } catch (e) {
      console.log("Error from login page: ", e)
    } finally {
      setIsLoading(false)
      toast.dismiss("login-loading")
    }
  }

  // === Toggle password visibility ===
  const togglePasswordVisibility = () => setIsVisible(prev => !prev)

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="bg-card font-rubik-400">

        {/* === Header Section === */}
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold">Welcome Back</CardTitle>
          <CardDescription>
            Please log in with your credentials.
          </CardDescription>
        </CardHeader>

        {/* === Login Form Section === */}
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

              {/* === Email Field === */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="w-full max-w-sm mx-auto">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="m@example.com"
                        className="border-b"
                        variant="minimal"
                        autoComplete="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* === Password Field === */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="max-w-sm mx-auto">
                    <FormLabel>
                      <div className="flex w-full items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-sm font-normal text-foreground underline-offset-4 hover:underline cursor-text">
                              Forgot password?
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="font-rubik-400">
                            <p>Contact us to reset your password</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          id="password"
                          type={isVisible ? "text" : "password"}
                          className="pe-10 pt-2 border-b"
                          placeholder="●●●●●●"
                          autoComplete="current-password"
                          variant="minimal"
                          {...field}
                        />
                        <Button type="button" size="icon" variant="ghost" onClick={togglePasswordVisibility} className="absolute inset-y-0 end-0 text-muted-foreground hover:bg-transparent" >
                          {isVisible ? <EyeOffIcon /> : <EyeIcon />}
                          <span className="sr-only">
                            {isVisible ? "Hide password" : "Show password"}
                          </span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* === Submit Button === */}
              <Button type="submit" disabled={isLoading} variant="green" className="w-full max-w-sm mx-auto">
                {isLoading && <Loader className="animate-spin size-4 text-white" />} Login
              </Button>

              {/* === Separator === */}
              <div className="text-center text-sm text-muted-foreground">Or</div>

              {/* === Social / Help Links === */}
              <div className="flex justify-center gap-3">
                {HelpLinks.map(({ href, icon, title }) => (
                  <Link key={title} href={href} target="_blank" rel="noopener noreferrer" aria-label={title} className={`rounded-sm bg-accent transition-all duration-300 scale-80 hover:scale-100 flex items-center justify-center w-10 h-10 overflow-hidden`}>
                    <Image src={icon} alt={title} width={28} height={28} className="object-contain" />
                  </Link>
                ))}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}