"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Wallet, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { setToken, setUser } = useStore();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Реєстрація
      const userResponse = await authApi.register(formData);

      // Автоматичний вхід після реєстрації
      const loginResponse = await authApi.login(formData.email, formData.password);

      // Зберігаємо токен і користувача
      setToken(loginResponse.data.access_token);
      setUser(userResponse.data);

      // Редірект на дашборд
      router.push("/dashboard");
    } catch (err: any) {
      import('@/lib/utils').then(({ formatError }) => {
        setError(formatError(err) || "Помилка реєстрації");
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted to-background p-4 animate-fade-in">
      <Card className="w-full max-w-md shadow-2xl animate-slide-up border-primary/10">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
            <Wallet className="w-8 h-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Реєстрація</CardTitle>
            <CardDescription>Створіть новий обліковий запис</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Ім'я</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  placeholder="Іван"
                  value={formData.first_name}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Прізвище</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  placeholder="Петренко"
                  value={formData.last_name}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg animate-shake border border-destructive/20">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full h-11 text-base transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]" disabled={isLoading}>
              {isLoading ? "Реєстрація..." : "Зареєструватися"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Вже маєте обліковий запис?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Увійти
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
