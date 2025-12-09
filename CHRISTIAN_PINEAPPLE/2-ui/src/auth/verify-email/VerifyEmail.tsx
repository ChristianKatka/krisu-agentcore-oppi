import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { confirmSignUp, resendSignUpCode } from "@aws-amplify/auth";
import Button from "@cloudscape-design/components/button";
import FormField from "@cloudscape-design/components/form-field";
import Input from "@cloudscape-design/components/input";
import Icon from "@cloudscape-design/components/icon";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Flashbar from "@cloudscape-design/components/flashbar";
import { Logo } from "../../shared/Logo";

export const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailFromUrl);
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const onVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      await confirmSignUp({
        username: email,
        confirmationCode: code,
      });

      console.log("Email verified successfully");
      setSuccess("Email verified successfully! Redirecting to login...");
      setTimeout(() => navigate("/"), 2000);
    } catch (err: any) {
      console.error("Verification error:", err);
      setError(err.message || "Failed to verify email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onResendCode = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setIsResending(true);
    setError("");
    setSuccess("");

    try {
      await resendSignUpCode({
        username: email,
      });

      console.log("Verification code resent");
      setSuccess("Verification code sent! Check your email.");
    } catch (err: any) {
      console.error("Resend error:", err);
      setError(err.message || "Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
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
              <h1 className="text-3xl font-bold text-white">Verify Email</h1>
              <p className="text-sm text-white/70 flex items-center justify-center gap-2">
                <Icon name="status-info" variant="subtle" />
                Enter the code sent to your email
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
          <form onSubmit={onVerify} className="space-y-5">
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
                    Verification Code
                  </span>
                }
              >
                <div className="backdrop-blur-sm bg-white/5 rounded-lg border border-white/10 focus-within:border-purple-400/50 transition-all">
                  <Input
                    type="text"
                    value={code}
                    onChange={({ detail }) => setCode(detail.value)}
                    placeholder="Enter 6-digit code"
                    inputMode="numeric"
                  />
                </div>
              </FormField>

              {/* Verify button */}
              <div className="pt-2">
                <Button
                  variant="primary"
                  formAction="submit"
                  loading={isLoading}
                  iconName="status-positive"
                  fullWidth
                  disabled={isLoading || isResending}
                >
                  {isLoading ? "Verifying..." : "Verify Email"}
                </Button>
              </div>

              {/* Resend code button */}
              <div className="text-center">
                <Button
                  variant="link"
                  onClick={onResendCode}
                  loading={isResending}
                  disabled={isLoading || isResending}
                  iconName="refresh"
                >
                  {isResending ? "Sending..." : "Resend Code"}
                </Button>
              </div>
            </SpaceBetween>
          </form>

          {/* Divider */}
          <div className="w-full border-t border-white/20"></div>

          {/* Back to login */}
          <div className="text-center space-y-2">
            <p className="text-sm text-white/60">Already verified?</p>
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
