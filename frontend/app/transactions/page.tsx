"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { transactionApi, categoryApi } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from "lucide-react";
import Link from "next/link";

interface Transaction {
  id: number;
  amount: number;
  type: "income" | "expense";
  description: string;
  date: string;
  category: {
    id: number;
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

export default function TransactionsPage() {
  const router = useRouter();
  const { token, user } = useStore();
  const currency = user?.currency || "UAH";
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">(
    "all",
  );
  const [filterCategory, setFilterCategory] = useState<string>("");

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    loadData();
  }, [token, router]);

  const loadData = async () => {
    try {
      const [transResp, catResp] = await Promise.all([
        transactionApi.getAll(),
        categoryApi.getAll(),
      ]);
      setTransactions(transResp.data);
      setCategories(catResp.data);
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Ви впевнені, що хочете видалити цю транзакцію?")) return;
    try {
      await transactionApi.delete(id);
      setTransactions(transactions.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Failed to delete transaction", err);
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.description
      ?.toLowerCase()
      .includes(search.toLowerCase());
    const matchesType = filterType === "all" || t.type === filterType;
    const matchesCategory =
      !filterCategory || t.category?.id === parseInt(filterCategory);
    return matchesSearch && matchesType && matchesCategory;
  });

  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Транзакції</h1>
            <p className="text-muted-foreground">
              Управління вашими доходами та витратами
            </p>
          </div>
          <Link href="/transactions/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Нова транзакція
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-green-500/10 border-green-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">
                Доходи
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">
                +{formatCurrency(totalIncome, currency)}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-red-500/10 border-red-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">
                Витрати
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700">
                -{formatCurrency(totalExpense, currency)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Баланс</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${totalIncome - totalExpense >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {formatCurrency(totalIncome - totalExpense, currency)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Пошук..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                className="h-10 rounded-md border border-input bg-background px-3"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
              >
                <option value="all">Всі типи</option>
                <option value="income">Доходи</option>
                <option value="expense">Витрати</option>
              </select>
              <select
                className="h-10 rounded-md border border-input bg-background px-3"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="">Всі категорії</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle>
              Список транзакцій ({filteredTransactions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Завантаження...</div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Транзакцій не знайдено</p>
                <Link href="/transactions/new">
                  <Button variant="outline" className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Додати першу транзакцію
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === "income"
                            ? "bg-green-500/10 text-green-600"
                            : "bg-red-500/10 text-red-600"
                        }`}
                      >
                        {transaction.type === "income" ? (
                          <ArrowUpRight className="w-5 h-5" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {transaction.description || "Без опису"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.category?.name} •{" "}
                          {formatDate(transaction.date)}
                          {new Date(transaction.date) > new Date() && (
                            <span className="ml-2 inline-flex items-center gap-1 text-xs font-medium text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full">
                              <Clock className="w-3 h-3" /> Очікується
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`font-semibold ${
                          transaction.type === "income"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(
                          transaction.amount,
                          transaction.currency || currency,
                        )}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(transaction.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
