import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { Mic } from "lucide-react";

const AuthForm = () => {
  const [activeTab, setActiveTab] = useState<string>("login");

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="grid md:grid-cols-2 gap-8 max-w-6xl w-full">
        {/* Auth Form */}
        <Card className="p-8 flex flex-col">
          <div className="flex items-center mb-8">
            <Mic className="text-primary text-2xl mr-3" />
            <h1 className="text-2xl font-semibold">Speech AI</h1>
          </div>

          <h2 className="text-2xl font-bold mb-2">
            {activeTab === "login" ? "Welcome Back" : "Create an Account"}
          </h2>
          <p className="text-muted-foreground mb-8">
            {activeTab === "login"
              ? "Sign in to your account to continue"
              : "Sign up for an account to get started"}
          </p>

          <Tabs
            defaultValue="login"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <LoginForm />
            </TabsContent>
            <TabsContent value="register">
              <RegisterForm onSuccess={() => setActiveTab("login")} />
            </TabsContent>
          </Tabs>
        </Card>

        {/* Features Showcase - Hidden on mobile */}
        <Card className="p-8 hidden md:block">
          <h2 className="text-2xl font-bold mb-6">Powerful Speech Tools</h2>
          <p className="text-muted-foreground mb-8">
            Process speech and text with our advanced AI platform
          </p>

          <div className="space-y-6">
            {/* Feature 1 */}
            <div className="flex">
              <div className="flex-shrink-0 w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mr-4">
                <Mic className="text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Speech-to-Text</h3>
                <p className="text-muted-foreground text-sm">
                  Convert spoken words to text with high accuracy in multiple
                  languages
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex">
              <div className="flex-shrink-0 w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mr-4">
                <svg
                  className="h-5 w-5 text-primary"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m5 8 6 6" />
                  <path d="m4 14 6-6 2-3" />
                  <path d="M2 5h12" />
                  <path d="M7 2h1" />
                  <path d="m22 22-5-10-5 10" />
                  <path d="M14 18h6" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium mb-1">Multilingual Translation</h3>
                <p className="text-muted-foreground text-sm">
                  Translate between English, Shona, Chinese, and Ndebele languages
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex">
              <div className="flex-shrink-0 w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mr-4">
                <svg
                  className="h-5 w-5 text-primary"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 15V9c0-4-2-5-5-5H7C4 4 2 5 2 9v6c0 4 2 5 5 5h10c3 0 5-1 5-5Z" />
                  <path d="M22 9V7" />
                  <path d="M22 17v-2" />
                  <path d="M11.43 9a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" />
                  <path d="M19.43 9a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" />
                  <path d="M7.43 13a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" />
                  <path d="M15.43 13a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" />
                  <path d="M11.43 17a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium mb-1">Text-to-Speech</h3>
                <p className="text-muted-foreground text-sm">
                  Convert text to natural-sounding speech in your preferred
                  language
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex">
              <div className="flex-shrink-0 w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mr-4">
                <svg
                  className="h-5 w-5 text-primary"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 12h4l3 8 4-16 3 8h4" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium mb-1">History Management</h3>
                <p className="text-muted-foreground text-sm">
                  Access and manage all your past translations and
                  transcriptions
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AuthForm;
