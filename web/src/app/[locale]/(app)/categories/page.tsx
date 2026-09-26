"use client";

import { useEffect, useState } from "react";
import { MoreVertical, Plus } from "lucide-react";
import CategoryFormDialog from "@/components/categories/category-form-dialog";
import DeleteCategoryDialog from "@/components/categories/delete-category-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Category, getCategories, updateCategory } from "@/lib/categories-api";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null,
  );

  async function loadCategories() {
    setIsLoading(true);
    setError("");
    try {
      const data = await getCategories();
      setCategories(data);
    } catch {
      setError("Failed to load categories.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;

    async function run() {
      try {
        const data = await getCategories();
        if (!ignore) setCategories(data);
      } catch {
        if (!ignore) setError("Failed to load categories.");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    void run();

    return () => {
      ignore = true;
    };
  }, []);

  const visibleCategories = showArchived
    ? categories
    : categories.filter((c) => !c.isArchived);

  function openCreateDialog() {
    setEditingCategory(null);
    setIsDialogOpen(true);
  }

  function openEditDialog(category: Category) {
    setEditingCategory(category);
    setIsDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      {categories.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Organize your transactions into income and expense categories.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="show-archived"
                checked={showArchived}
                onCheckedChange={setShowArchived}
              />
              <Label
                htmlFor="show-archived"
                className="text-sm text-muted-foreground"
              >
                Show archived
              </Label>
            </div>
            <Button onClick={openCreateDialog}>
              <Plus className="size-4" />
              Add category
            </Button>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      )}

      {!isLoading && error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {!isLoading && !error && categories.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <p className="text-sm font-medium">No categories yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add a category to start organizing your transactions.
          </p>
          <Button className="mt-4" onClick={openCreateDialog}>
            <Plus className="size-4" />
            Add your first category
          </Button>
        </div>
      )}

      {!isLoading && !error && categories.length > 0 && (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleCategories.map((category) => (
                <TableRow
                  key={category.id}
                  className={category.isArchived ? "opacity-50" : ""}
                >
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        category.type === "INCOME"
                          ? "border-success/30 text-success"
                          : "border-destructive/30 text-destructive"
                      }
                    >
                      {category.type === "INCOME" ? "Income" : "Expense"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => openEditDialog(category)}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={async () => {
                            await updateCategory(category.id, {
                              isArchived: !category.isArchived,
                            });
                            loadCategories();
                          }}
                        >
                          {category.isArchived ? "Unarchive" : "Archive"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeletingCategory(category)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CategoryFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={loadCategories}
        category={editingCategory}
      />

      <DeleteCategoryDialog
        category={deletingCategory}
        onOpenChange={(open) => {
          if (!open) setDeletingCategory(null);
        }}
        onSuccess={loadCategories}
      />
    </div>
  );
}
