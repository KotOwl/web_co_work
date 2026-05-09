"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { statsApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from "recharts";
import { Download, TrendingUp, TrendingDown, PieChart as PieIcon } from "lucide-react";

interface ChartData {
  name: string;
  income: number;
  expense: number;
}

interface PieData {
  name: string;
  value: number;
  color: string;
}

export default function StatisticsPage() {
  const router = useRouter();
  const { token, user } = useStore();
  const [monthlyData, setMonthlyData] = useState<ChartData[]>([]);
  const [expenseData, setExpenseData] = useState<PieData[]>([]);
  const [incomeData, setIncomeData] = useState<PieData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState("6months");

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchStats = async () => {
      try {
        // Monthly stats
        const monthlyResponse = await statsApi.getMonthly(6);
        const chartData = monthlyResponse.data.map((item: any) => ({
          name: item.period,
          income: item.income,
          expense: item.expense,
        }));
        setMonthlyData(chartData);

        // Category stats for pie charts
        const [expenseCats, incomeCats] = await Promise.all([
          statsApi.getCategories({ type: "expense" }),
          statsApi.getCategories({ type: "income" }),
        ]);

        setExpenseData(
          expenseCats.data.map((item: any) => ({
            name: item.category.name,
            value: item.total,
            color: item.category.color,
          }))
        );

        setIncomeData(
          incomeCats.data.map((item: any) => ({
            name: item.category.name,
            value: item.total,
            color: item.category.color,
          }))
        );
      } catch (error) {
        console.error("Failed to fetch statistics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [token, router]);

  const handleExportCSV = () => {
    // Export functionality
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Period,Income,Expense,Balance\n" +
      monthlyData.map(row => 
        `${row.name},${row.income},${row.expense},${row.income - row.expense}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "finance_stats.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Статистика</h1>
            <p className="text-muted-foreground">Детальний аналіз ваших фінансів</p>
          </div>
          <Button onClick={handleExportCSV} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Експорт CSV
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Загальний дохід</CardTitle>
              <TrendingUp className="w-4 h-4 text-income" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-income">
                {formatCurrency(monthlyData.reduce((sum, m) => sum + m.income, 0), user?.currency)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Загальні витрати</CardTitle>
              <TrendingDown className="w-4 h-4 text-expense" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-expense">
                {formatCurrency(monthlyData.reduce((sum, m) => sum + m.expense, 0), user?.currency)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Чистий баланс</CardTitle>
              <PieIcon className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(
                  monthlyData.reduce((sum, m) => sum + m.income - m.expense, 0),
                  user?.currency
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="monthly" className="space-y-4">
          <TabsList>
            <TabsTrigger value="monthly">Місячна динаміка</TabsTrigger>
            <TabsTrigger value="expenses">Структура витрат</TabsTrigger>
            <TabsTrigger value="income">Структура доходів</TabsTrigger>
          </TabsList>

          <TabsContent value="monthly">
            <Card>
              <CardHeader>
                <CardTitle>Доходи vs Витрати</CardTitle>
                <CardDescription>Динаміка за останні 6 місяців</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => {
                          const [year, month] = value.split("-");
                          return `${month}.${year}`;
                        }}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value, user?.currency)}
                        contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                      />
                      <Legend />
                      <Bar dataKey="income" name="Доходи" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expense" name="Витрати" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses">
            <Card>
              <CardHeader>
                <CardTitle>Розподіл витрат</CardTitle>
                <CardDescription>Витрати за категоріями</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {expenseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value, user?.currency)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="income">
            <Card>
              <CardHeader>
                <CardTitle>Розподіл доходів</CardTitle>
                <CardDescription>Джерела доходу</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={incomeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {incomeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value, user?.currency)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
