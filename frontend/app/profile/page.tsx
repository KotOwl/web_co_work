"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { userApi, authApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { User, Mail, Save, LogOut, Moon, Sun, CheckCircle } from "lucide-react";

interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  currency: string;
}

const CURRENCIES = [
  { code: "UAH", name: "Українська гривня", symbol: "₴" },
  { code: "USD", name: "Долар США", symbol: "$" },
  { code: "EUR", name: "Євро", symbol: "€" },
  { code: "PLN", name: "Польський злотий", symbol: "zł" },
];

export default function ProfilePage() {
  const router = useRouter();
  const { token, user, setUser, logout, isDarkMode, toggleDarkMode } = useStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    currency: "UAH",
  });

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    loadProfile();
  }, [token, router]);

  const loadProfile = async () => {
    try {
      const response = await userApi.getProfile();
      setProfile(response.data);
      setFormData({
        first_name: response.data.first_name || "",
        last_name: response.data.last_name || "",
        email: response.data.email,
        currency: response.data.currency || "UAH",
      });
    } catch (err) {
      console.error("Failed to load profile", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage("");
    try {
      const response = await userApi.updateProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
        currency: formData.currency,
      });
      setUser(response.data);
      setMessage("Профіль оновлено успішно!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Failed to update profile", err);
      setMessage("Помилка при оновленні профілю");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Завантаження...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Профіль</h1>
          <p className="text-muted-foreground">Управління вашим обліковим записом</p>
        </div>

        {/* Success Message */}
        {message && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-700">{message}</p>
          </div>
        )}

        {/* Profile Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Особиста інформація
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Ім&apos;я</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="Ваше ім'я"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Прізвище</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Ваше прізвище"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="pl-10 bg-muted"
                />
              </div>
              <p className="text-xs text-muted-foreground">Email не можна змінити</p>
            </div>
          </CardContent>
        </Card>

        {/* Preferences Card */}
        <Card>
          <CardHeader>
            <CardTitle>Налаштування</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Currency */}
            <div className="space-y-2">
              <Label htmlFor="currency">Валюта</Label>
              <select
                id="currency"
                className="w-full h-10 rounded-md border border-input bg-background px-3"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              >
                {CURRENCIES.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.symbol} - {curr.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Dark Mode */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-medium">Темна тема</p>
                  <p className="text-sm text-muted-foreground">Змінити оформлення інтерфейсу</p>
                </div>
              </div>
              <Button variant={isDarkMode ? "default" : "outline"} onClick={toggleDarkMode}>
                {isDarkMode ? "Увімкнено" : "Вимкнено"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            className="flex-1 text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Вийти
          </Button>
          <Button className="flex-1" onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Збереження..." : "Зберегти зміни"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
