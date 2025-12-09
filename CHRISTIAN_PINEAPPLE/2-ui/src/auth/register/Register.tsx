import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signUp } from "@aws-amplify/auth";
import Button from "@cloudscape-design/components/button";
import FormField from "@cloudscape-design/components/form-field";
import Input from "@cloudscape-design/components/input";
import Icon from "@cloudscape-design/components/icon";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Flashbar from "@cloudscape-design/components/flashbar";
import { Logo } from "../../shared/Logo";

export const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const onRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await signUp({
        username: email,
        password: password,
        options: {
          userAttributes: {
            email: email,
          },
        },
      });

      console.log("Registration successful:", result);

      if (result.isSignUpComplete) {
        setSuccess("Account created successfully! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      } else if (result.nextStep.signUpStep === "CONFIRM_SIGN_UP") {
        setSuccess("Account created! Redirecting to verification...");
        setTimeout(
          () => navigate(`/verify-email?email=${encodeURIComponent(email)}`),
          1500
        );
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Glass card */}
      <div className="relative w-full max-w-md">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8 space-y-6">
          {/* Logo section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl blur-lg opacity-50"></div>
              <Logo
                size="xl"
                className="relative rounded-2xl ring-2 ring-white/30"
                alt="Logo"
              />
            </div>
            <div className="text-center space-y-1">
              <h1 className="text-3xl font-bold text-white">Create Account</h1>
              <p className="text-sm text-white/70 flex items-center justify-center gap-2">
                <Icon name="add-plus" variant="subtle" />
                Join Chat today
              </p>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <Flashbar
              items={[
                {
                  type: "error",
                  content: error,
                  dismissible: true,
                  onDismiss: () => setError(""),
                },
              ]}
            />
          )}
          {success && (
            <Flashbar
              items={[
                {
                  type: "success",
                  content: success,
                  dismissible: true,
                  onDismiss: () => setSuccess(""),
                },
              ]}
            />
          )}

          {/* Form */}
          <form onSubmit={onRegister} className="space-y-5">
            <SpaceBetween size="m">
              <FormField
                label={
                  <span className="text-white/90 font-medium flex items-center gap-2">
                    <Icon name="contact" variant="subtle" />
                    Email Address
                  </span>
                }
              >
                <div className="backdrop-blur-sm bg-white/5 rounded-lg border border-white/10 focus-within:border-purple-400/50 transition-all">
                  <Input
                    type="email"
                    value={email}
                    onChange={({ detail }) => setEmail(detail.value)}
                    placeholder="name@company.com"
                    inputMode="email"
                  />
                </div>
              </FormField>

              <FormField
                label={
                  <span className="text-white/90 font-medium flex items-center gap-2">
                    <Icon name="lock-private" variant="subtle" />
                    Password
                  </span>
                }
              >
                <div className="backdrop-blur-sm bg-white/5 rounded-lg border border-white/10 focus-within:border-purple-400/50 transition-all">
                  <Input
                    type="password"
                    value={password}
                    onChange={({ detail }) => setPassword(detail.value)}
                    placeholder="••••••••"
                  />
                </div>
              </FormField>

              {/* Register button */}
              <div className="pt-2">
                <Button
                  variant="primary"
                  formAction="submit"
                  loading={isLoading}
                  iconName="add-plus"
                  fullWidth
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </div>
            </SpaceBetween>
          </form>

          {/* Divider */}
          <div className="w-full border-t border-white/20"></div>

          {/* Login section */}
          <div className="text-center space-y-2">
            <p className="text-sm text-white/60">Already have an account?</p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-purple-300 hover:text-purple-200 transition-colors font-medium"
            >
              <Icon name="unlocked" variant="subtle" />
              Sign in
            </Link>
          </div>
        </div>

        {/* Bottom glow effect */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-gradient-to-r from-purple-500/50 via-blue-500/50 to-purple-500/50 blur-xl"></div>
      </div>
    </main>
  );
};
