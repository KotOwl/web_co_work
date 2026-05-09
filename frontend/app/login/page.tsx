"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { setToken, setUser } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetSent, setIsResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const response = await authApi.login(email, password);
      const { access_token } = response.data;
      
      setToken(access_token);
      
      // Get user profile
      // const userResponse = await userApi.getProfile();
      // setUser(userResponse.data);
      
      router.push("/dashboard");
    } catch (err: any) {
      import('@/lib/utils').then(({ formatError }) => {
        setError(formatError(err) || "Помилка входу");
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authApi.forgotPassword(resetEmail);
      setIsResetSent(true);
    } catch (err: any) {
      import('@/lib/utils').then(({ formatError }) => {
        setError(formatError(err) || "Помилка при відновленні пароля");
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted to-background p-4 animate-fade-in relative overflow-hidden">
        {/* Decorative Blobs */}
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl animate-pulse delay-700" />

        <Card className="w-full max-w-md shadow-2xl animate-scale-in border-primary/10 relative z-10">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Wallet className="w-8 h-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Відновлення пароля</CardTitle>
              <CardDescription>
                {isResetSent 
                  ? "Перевірте вашу пошту для подальших інструкцій" 
                  : "Введіть вашу пошту, щоб отримати посилання для скидання"}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {!isResetSent ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="you@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full h-11" disabled={isLoading}>
                  {isLoading ? "Надсилаємо..." : "Надіслати посилання"}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full" 
                  onClick={() => setIsForgotPassword(false)}
                >
                  Повернутися до входу
                </Button>
              </form>
            ) : (
              <Button 
                type="button" 
                className="w-full h-11" 
                onClick={() => setIsForgotPassword(false)}
              >
                Повернутися до входу
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted to-background p-4 animate-fade-in relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />

      <Card className="w-full max-w-md shadow-2xl animate-slide-up border-primary/10 relative z-10">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
            <Wallet className="w-8 h-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Вітаємо!</CardTitle>
            <CardDescription>Увійдіть до свого облікового запису</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Запам'ятати мене
                </label>
              </div>
              <button
                type="button"
                onClick={() => setIsForgotPassword(true)}
                className="text-sm text-primary hover:underline font-medium"
              >
                Забули пароль?
              </button>
            </div>
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg animate-shake border border-destructive/20">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full h-11 text-base transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]" disabled={isLoading}>
              {isLoading ? "Вхід..." : "Увійти"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Ще не маєте облікового запису?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Зареєструватися
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
