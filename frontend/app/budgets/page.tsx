"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { budgetApi, categoryApi, statsApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Plus, Trash2, Target, AlertCircle, CheckCircle } from "lucide-react";

interface Budget {
  id: number;
  amount: number;
  spent: number;
  period: "monthly" | "yearly";
  category_id: number;
  category: {
    name: string;
    icon: string;
    color: string;
  };
}

interface Category {
  id: number;
  name: string;
  type: "income" | "expense";
}

export default function BudgetsPage() {
  const router = useRouter();
  const { token, user } = useStore();
  const currency = user?.currency || "UAH";
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newBudget, setNewBudget] = useState({
    category_id: "",
    amount: "",
    period: "monthly" as "monthly" | "yearly",
  });

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    loadData();
  }, [token, router]);

  const loadData = async () => {
    try {
      const [budgetsResp, catResp] = await Promise.all([
        budgetApi.getAll(),
        categoryApi.getAll("expense"),
      ]);
      setBudgets(budgetsResp.data);
      setCategories(catResp.data);
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newBudget.category_id || !newBudget.amount) return;
    try {
      await budgetApi.create({
        category_id: parseInt(newBudget.category_id),
        amount: parseFloat(newBudget.amount),
        period: newBudget.period,
      });
      setNewBudget({ category_id: "", amount: "", period: "monthly" });
      setIsAdding(false);
      loadData();
    } catch (err) {
      console.error("Failed to create budget", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Видалити бюджет?")) return;
    try {
      await budgetApi.delete(id);
      loadData();
    } catch (err) {
      console.error("Failed to delete budget", err);
    }
  };

  const getProgress = (budget: Budget) => {
    return Math.min((budget.spent / budget.amount) * 100, 100);
  };

  const getStatus = (budget: Budget) => {
    const percentage = (budget.spent / budget.amount) * 100;
    if (percentage >= 100) return "over";
    if (percentage >= 80) return "warning";
    return "good";
  };

  const availableCategories = categories.filter(
    (cat) => !budgets.some((b) => b.category_id === cat.id),
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Бюджети</h1>
            <p className="text-muted-foreground">
              Встановіть ліміти витрат для категорій
            </p>
          </div>
          <Button
            onClick={() => setIsAdding(!isAdding)}
            disabled={availableCategories.length === 0}
          >
            <Plus className="w-4 h-4 mr-2" />
            {isAdding ? "Скасувати" : "Новий бюджет"}
          </Button>
        </div>

        {/* Add Budget Form */}
        {isAdding && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Новий бюджет</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Категорія</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3"
                    value={newBudget.category_id}
                    onChange={(e) =>
                      setNewBudget({
                        ...newBudget,
                        category_id: e.target.value,
                      })
                    }
                  >
                    <option value="">Оберіть категорію</option>
                    {availableCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Ліміт (₴)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={newBudget.amount}
                    onChange={(e) =>
                      setNewBudget({ ...newBudget, amount: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Період</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3"
                    value={newBudget.period}
                    onChange={(e) =>
                      setNewBudget({
                        ...newBudget,
                        period: e.target.value as any,
                      })
                    }
                  >
                    <option value="monthly">Щомісячно</option>
                    <option value="yearly">Щорічно</option>
                  </select>
                </div>
              </div>
              <Button onClick={handleCreate} className="w-full">
                <Target className="w-4 h-4 mr-2" />
                Створити бюджет
              </Button>
            </CardContent>
          </Card>
        )}

        {availableCategories.length === 0 &&
          !isAdding &&
          budgets.length > 0 && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <p className="text-yellow-700">Всі категорії вже мають бюджети</p>
            </div>
          )}

        {/* Budgets Grid */}
        {isLoading ? (
          <div className="text-center py-8">Завантаження...</div>
        ) : budgets.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Немає бюджетів</h3>
            <p className="text-muted-foreground mb-4">
              Встановіть ліміти витрат щоб контролювати свої фінанси
            </p>
            <Button onClick={() => setIsAdding(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Створити перший бюджет
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgets.map((budget) => {
              const progress = getProgress(budget);
              const status = getStatus(budget);
              const spent = budget.spent || 0;
              const remaining = budget.amount - spent;

              return (
                <Card key={budget.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                          style={{
                            backgroundColor: budget.category.color + "20",
                            color: budget.category.color,
                          }}
                        >
                          {budget.category.icon}
                        </div>
                        <div>
                          <CardTitle className="text-base">
                            {budget.category.name}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground">
                            {budget.period === "monthly"
                              ? "Щомісячно"
                              : "Щорічно"}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDelete(budget.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Витрачено: {formatCurrency(spent, currency)}
                        </span>
                        <span className="font-medium">
                          {formatCurrency(budget.amount, currency)}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            status === "over"
                              ? "bg-red-500"
                              : status === "warning"
                                ? "bg-yellow-500"
                                : "bg-green-500"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {progress.toFixed(0)}%
                        </span>
                        {status === "over" ? (
                          <span className="text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Перевищено на{" "}
                            {formatCurrency(Math.abs(remaining), currency)}
                          </span>
                        ) : status === "warning" ? (
                          <span className="text-xs text-yellow-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Залишилось {formatCurrency(remaining, currency)}
                          </span>
                        ) : (
                          <span className="text-xs text-green-600 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Залишилось {formatCurrency(remaining, currency)}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
