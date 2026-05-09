"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { transactionApi, categoryApi } from "@/lib/api";
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
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";

interface Category {
  id: number;
  name: string;
  type: "income" | "expense";
  icon: string;
  color: string;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  UAH: "₴",
  USD: "$",
  EUR: "€",
  PLN: "zł",
};

export default function NewTransactionPage() {
  const router = useRouter();
  const { token, user } = useStore();
  const currency = user?.currency || "UAH";
  const currencySymbol = CURRENCY_SYMBOLS[currency] || "₴";
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    type: "expense" as "income" | "expense",
    amount: "",
    description: "",
    category_id: "",
    currency: user?.currency || "UAH",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    loadCategories();
  }, [token, router]);

  const loadCategories = async () => {
    try {
      const response = await categoryApi.getAll();
      setCategories(response.data);
      // Set default category if available
      if (response.data.length > 0) {
        setFormData((prev) => ({
          ...prev,
          category_id: String(response.data[0].id),
        }));
      }
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await transactionApi.create({
        type: formData.type,
        amount: parseFloat(formData.amount),
        description: formData.description,
        category_id: parseInt(formData.category_id),
        currency: formData.currency,
        date: formData.date,
      });
      router.push("/dashboard");
    } catch (err: any) {
      import('@/lib/utils').then(({ formatError }) => {
        setError(formatError(err) || "Помилка при створенні транзакції");
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCategories = categories.filter((c) => c.type === formData.type);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 animate-fade-in">
          <Link href="/dashboard">
            <Button variant="outline" size="icon" className="transition-transform hover:-translate-x-1">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Нова транзакція
            </h1>
            <p className="text-muted-foreground">
              Додайте новий дохід або витрату
            </p>
          </div>
        </div>

        {/* Form */}
        <Card className="max-w-2xl animate-slide-up delay-100 shadow-lg border-primary/5">
          <CardHeader>
            <CardTitle>Деталі транзакції</CardTitle>
            <CardDescription>Заповніть інформацію про операцію</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Type Selection */}
              <div className="space-y-2">
                <Label>Тип транзакції</Label>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant={
                      formData.type === "expense" ? "default" : "outline"
                    }
                    className={`flex-1 transition-all duration-300 ${formData.type === "expense" ? "scale-105 shadow-md" : "hover:bg-muted"}`}
                    onClick={() =>
                      setFormData({ ...formData, type: "expense" })
                    }
                  >
                    Витрата
                  </Button>
                  <Button
                    type="button"
                    variant={formData.type === "income" ? "default" : "outline"}
                    className={`flex-1 transition-all duration-300 ${formData.type === "income" ? "scale-105 shadow-md" : "hover:bg-muted"}`}
                    onClick={() => setFormData({ ...formData, type: "income" })}
                  >
                    Дохід
                  </Button>
                </div>
              </div>

              {/* Amount & Currency */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Сума</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Валюта</Label>
                  <select
                    id="currency"
                    className="w-full h-10 rounded-md border border-input bg-background px-3"
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData({ ...formData, currency: e.target.value })
                    }
                    required
                  >
                    <option value="UAH">₴ UAH</option>
                    <option value="USD">$ USD</option>
                    <option value="EUR">€ EUR</option>
                    <option value="PLN">zł PLN</option>
                  </select>
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Категорія</Label>
                <select
                  id="category"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData({ ...formData, category_id: e.target.value })
                  }
                  required
                >
                  <option value="">Оберіть категорію</option>
                  {filteredCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Опис</Label>
                <Input
                  id="description"
                  placeholder="Наприклад: Продукти в магазині"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date">Дата</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                />
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg animate-shake border border-destructive/20">
                  {error}
                </div>
              )}

              {/* Submit */}
              <div className="flex gap-4">
                <Link href="/dashboard" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Скасувати
                  </Button>
                </Link>
                <Button type="submit" className="flex-1 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]" disabled={isLoading}>
                  {isLoading ? (
                    "Збереження..."
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Додати транзакцію
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
