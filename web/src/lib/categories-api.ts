import { apiDelete, apiGet, apiPatch, apiPost } from "./api";

export type CategoryType = "INCOME" | "EXPENSE";

export type Category = {
  id: string;
  name: string;
  type: CategoryType;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
};

export function getCategories(): Promise<Category[]> {
  return apiGet<Category[]>("/categories");
}

export function createCategory(data: {
  name: string;
  type: CategoryType;
}): Promise<Category> {
  return apiPost<Category>("/categories", data);
}

export function updateCategory(
  id: string,
  data: Partial<{ name: string; type: CategoryType; isArchived: boolean }>,
): Promise<Category> {
  return apiPatch<Category>(`/categories/${id}`, data);
}

export function deleteCategory(id: string): Promise<{ message: string }> {
  return apiDelete<{ message: string }>(`/categories/${id}`);
}
