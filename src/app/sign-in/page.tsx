import { SignIn } from "@clerk/nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
        
          <h1 className="text-2xl font-semibold tracking-tight">AutoParts IMS</h1>
          <p className="text-sm text-muted-foreground">Sign in to access your inventory management system</p>
        </div>

        <Card className="w-fit">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Sign in</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent className="">
            <SignIn
              appearance={{
                elements: {
                  formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
                  footerAction: "hidden",
                  socialButtonsIconButton: "hidden",
                  socialButtonsBlockButton: "hidden",
                  socialButtonsProviderIcon: "hidden",
                  dividerRow: "hidden",
                  dividerText: "hidden",
                  formFieldInput: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                },
              }}
              path="/sign-in"
              signUpUrl="/sign-up" // Updated to provide a valid sign-up URL
              redirectUrl="/(protected)/" // Ensure this points to a valid route
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

