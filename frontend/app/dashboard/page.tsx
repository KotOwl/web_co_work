"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { statsApi, transactionApi, budgetApi, userApi } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  AlertTriangle,
} from "lucide-react";

interface DashboardStats {
  current_balance: number;
  monthly_income: number;
  monthly_expense: number;
  top_expenses: Array<{
    category: {
      name: string;
      icon: string;
      color: string;
    };
    total: number;
    percentage: number;
  }>;
  recent_transactions: Array<{
    id: number;
    amount: number;
    type: "income" | "expense";
    description: string;
    date: string;
    category: {
      name: string;
      icon: string;
      color: string;
    };
    currency?: string;
  }>;
  budgets: Array<{
    id: number;
    amount: number;
    spent: number;
    category: {
      name: string;
    };
  }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const { token, user, setUser } = useStore();
  const currency = user?.currency || "UAH";
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isChangingCurrency, setIsChangingCurrency] = useState(false);

  const fetchStats = async () => {
    try {
      const [statsResp, budgetsResp] = await Promise.all([
        statsApi.getDashboard(),
        budgetApi.getAll(),
      ]);
      setStats({ ...statsResp.data, budgets: budgetsResp.data });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    fetchStats();
  }, [token, router]);

  const handleCurrencyChange = async (newCurrency: string) => {
    setIsChangingCurrency(true);
    try {
      const response = await userApi.updateProfile({ currency: newCurrency });
      setUser(response.data);
      await fetchStats();
    } catch (err) {
      console.error("Failed to update currency", err);
    } finally {
      setIsChangingCurrency(false);
    }
  };

  if (isLoading && !stats) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          {/* Skeleton Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="h-8 w-64 bg-muted rounded-md animate-pulse"></div>
              <div className="h-4 w-48 bg-muted rounded-md animate-pulse"></div>
            </div>
            <div className="h-10 w-full sm:w-48 bg-muted rounded-md animate-pulse"></div>
          </div>
          
          {/* Skeleton Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-muted rounded-xl animate-pulse"></div>
            ))}
          </div>
          
          {/* Skeleton Charts/Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="h-80 bg-muted rounded-xl animate-pulse"></div>
            <div className="h-80 bg-muted rounded-xl animate-pulse"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!stats) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Не вдалося завантажити дані</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className={`space-y-6 ${isChangingCurrency ? "opacity-50 pointer-events-none" : ""}`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold">
              Привіт, {user?.first_name || "Користувач"}!
            </h1>
            <p className="text-muted-foreground">Ось огляд ваших фінансів</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <select
              className="h-10 rounded-md border border-input bg-background px-3 font-medium cursor-pointer hover:bg-muted/50 transition-colors"
              value={user?.currency || "UAH"}
              onChange={(e) => handleCurrencyChange(e.target.value)}
            >
              <option value="UAH">₴ Гривня</option>
              <option value="USD">$ Долар</option>
              <option value="EUR">€ Євро</option>
              <option value="PLN">zł Злотий</option>
            </select>
            <Button onClick={() => router.push("/transactions/new")} className="w-full sm:w-auto transition-transform hover:scale-[1.02] active:scale-[0.98]">
              + Додати транзакцію
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="animate-slide-up shadow-sm hover:shadow-md transition-shadow border-primary/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Загальний баланс
              </CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.current_balance, user?.currency)}
              </div>
            </CardContent>
          </Card>

          <Card className="animate-slide-up delay-100 shadow-sm hover:shadow-md transition-shadow border-income/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Доходи за місяць
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-income" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-income">
                {formatCurrency(stats.monthly_income, user?.currency)}
              </div>
            </CardContent>
          </Card>

          <Card className="animate-slide-up delay-200 shadow-sm hover:shadow-md transition-shadow border-expense/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Витрати за місяць
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-expense" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-expense">
                {formatCurrency(stats.monthly_expense, user?.currency)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Budget Alerts */}
        {stats.budgets.some(b => (b.spent / b.amount) >= 0.8) && (
          <div className="grid grid-cols-1 gap-4 animate-fade-in">
            {stats.budgets
              .filter(b => (b.spent / b.amount) >= 0.8)
              .map(budget => {
                const percentage = (budget.spent / budget.amount) * 100;
                const isOver = percentage >= 100;
                return (
                  <div 
                    key={budget.id} 
                    className={`p-4 rounded-lg border flex items-center justify-between ${
                      isOver 
                        ? "bg-red-500/10 border-red-500/20 text-red-700" 
                        : "bg-yellow-500/10 border-yellow-500/20 text-yellow-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <AlertTriangle className={`w-5 h-5 ${isOver ? "text-red-500" : "text-yellow-500"}`} />
                      <div>
                        <p className="font-bold text-sm">
                          {isOver ? "БЮДЖЕТ ПЕРЕВИЩЕНО" : "УВАГА: БЮДЖЕТ МАЙЖЕ ВИЧЕРПАНО"}
                        </p>
                        <p className="text-xs opacity-80">
                          Категорія: {budget.category.name} ({percentage.toFixed(0)}% використано)
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => router.push("/budgets")}
                      className="bg-white/50 border-none hover:bg-white"
                    >
                      Детальніше
                    </Button>
                  </div>
                );
              })}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <Card className="col-span-1 animate-scale-in delay-300">
            <CardHeader>
              <CardTitle>Останні транзакції</CardTitle>
              <CardDescription>Ваші останні фінансові операції</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input
                  placeholder="Пошук транзакцій..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-muted/30 border-none"
                />
              </div>
              <div className="space-y-4">
                {stats.recent_transactions
                  .filter(t => 
                    t.description?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    t.category.name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 hover:translate-x-1 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: `${transaction.category.color}20`,
                        }}
                      >
                        <span style={{ color: transaction.category.color }}>
                          {transaction.type === "income" ? (
                            <ArrowUpRight className="w-5 h-5" />
                          ) : (
                            <ArrowDownRight className="w-5 h-5" />
                          )}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {transaction.category.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.description || "Без опису"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          transaction.type === "income"
                            ? "text-income"
                            : "text-expense"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(
                          transaction.amount,
                          transaction.currency || user?.currency,
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(transaction.date)}
                        {new Date(transaction.date) > new Date() && (
                          <span className="ml-1 inline-flex items-center gap-0.5 text-[10px] font-medium text-orange-500">
                            <Clock className="w-2.5 h-2.5" /> Оч.
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
                {stats.recent_transactions.filter(t => 
                  t.description?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  t.category.name.toLowerCase().includes(searchQuery.toLowerCase())
                ).length === 0 && (
                  <p className="text-center text-muted-foreground py-8 animate-fade-in">
                    {searchQuery ? "Нічого не знайдено" : "Немає транзакцій"}
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => router.push("/transactions")}
              >
                Переглянути всі
              </Button>
            </CardContent>
          </Card>

          {/* Top Expense Categories */}
          <Card className="col-span-1 animate-scale-in delay-300">
            <CardHeader>
              <CardTitle>Топ категорій витрат</CardTitle>
              <CardDescription>Найбільші витрати за цей місяць</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.top_expenses.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.category.color }}
                        />
                        <span className="font-medium">
                          {item.category.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold">
                          {formatCurrency(item.total, user?.currency)}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {item.percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: item.category.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
                {stats.top_expenses.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Немає даних про витрати
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
