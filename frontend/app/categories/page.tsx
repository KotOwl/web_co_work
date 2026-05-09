"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { categoryApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Plus, Trash2, Tag, Edit2, Save, X } from "lucide-react";

interface Category {
  id: number;
  name: string;
  type: "income" | "expense";
  icon: string;
  color: string;
  is_default: boolean;
}

const ICONS = ["💰", "💳", "🍔", "🚗", "🏠", "📱", "👕", "🎮", "📚", "💊", "🎁", "✈️", "💡", "🐶", "🌟"];
const COLORS = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

export default function CategoriesPage() {
  const router = useRouter();
  const { token } = useStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: "",
    type: "expense" as "income" | "expense",
    icon: "💰",
    color: "#3b82f6",
  });
  const [editCategory, setEditCategory] = useState({
    name: "",
    icon: "",
    color: "",
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
    } catch (err) {
      console.error("Failed to load categories", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newCategory.name.trim()) return;
    try {
      await categoryApi.create(newCategory);
      setNewCategory({ name: "", type: "expense", icon: "💰", color: "#3b82f6" });
      setIsAdding(false);
      loadCategories();
    } catch (err) {
      console.error("Failed to create category", err);
    }
  };

  const handleUpdate = async (id: number) => {
    try {
      await categoryApi.update(id, editCategory);
      setEditingId(null);
      loadCategories();
    } catch (err) {
      console.error("Failed to update category", err);
    }
  };

  const handleDelete = async (id: number, isDefault: boolean) => {
    if (isDefault) {
      alert("Неможливо видалити стандартну категорію");
      return;
    }
    if (!confirm("Ви впевнені?")) return;
    try {
      await categoryApi.delete(id);
      loadCategories();
    } catch (err) {
      console.error("Failed to delete category", err);
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditCategory({
      name: category.name,
      icon: category.icon,
      color: category.color,
    });
  };

  const incomeCategories = categories.filter((c) => c.type === "income");
  const expenseCategories = categories.filter((c) => c.type === "expense");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Категорії</h1>
            <p className="text-muted-foreground">Управління категоріями доходів та витрат</p>
          </div>
          <Button onClick={() => setIsAdding(!isAdding)}>
            <Plus className="w-4 h-4 mr-2" />
            {isAdding ? "Скасувати" : "Нова категорія"}
          </Button>
        </div>

        {/* Add Category Form */}
        {isAdding && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Нова категорія</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Назва</Label>
                  <Input
                    placeholder="Наприклад: Кафе"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Тип</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3"
                    value={newCategory.type}
                    onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value as any })}
                  >
                    <option value="expense">Витрата</option>
                    <option value="income">Дохід</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Іконка</Label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setNewCategory({ ...newCategory, icon })}
                      className={`w-10 h-10 rounded-lg text-xl transition-all ${
                        newCategory.icon === icon
                          ? "bg-primary text-primary-foreground ring-2 ring-primary"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Колір</Label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewCategory({ ...newCategory, color })}
                      className={`w-8 h-8 rounded-full transition-all ${
                        newCategory.color === color ? "ring-2 ring-offset-2 ring-primary" : ""
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <Button onClick={handleCreate} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Зберегти категорію
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Categories Grid */}
        {isLoading ? (
          <div className="text-center py-8">Завантаження...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Expense Categories */}
            <Card>
              <CardHeader className="bg-red-500/5">
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <Tag className="w-5 h-5" />
                  Категорії витрат ({expenseCategories.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {expenseCategories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                        style={{ backgroundColor: category.color + "20", color: category.color }}
                      >
                        {category.icon}
                      </div>
                      {editingId === category.id ? (
                        <div className="flex-1 flex gap-2">
                          <Input
                            value={editCategory.name}
                            onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
                            className="h-8"
                          />
                          <Button size="icon" variant="ghost" onClick={() => handleUpdate(category.id)}>
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => setEditingId(null)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <span className="flex-1 font-medium">{category.name}</span>
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" onClick={() => startEdit(category)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDelete(category.id, category.is_default)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Income Categories */}
            <Card>
              <CardHeader className="bg-green-500/5">
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <Tag className="w-5 h-5" />
                  Категорії доходів ({incomeCategories.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {incomeCategories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                        style={{ backgroundColor: category.color + "20", color: category.color }}
                      >
                        {category.icon}
                      </div>
                      {editingId === category.id ? (
                        <div className="flex-1 flex gap-2">
                          <Input
                            value={editCategory.name}
                            onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
                            className="h-8"
                          />
                          <Button size="icon" variant="ghost" onClick={() => handleUpdate(category.id)}>
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => setEditingId(null)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <span className="flex-1 font-medium">{category.name}</span>
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" onClick={() => startEdit(category)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDelete(category.id, category.is_default)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
