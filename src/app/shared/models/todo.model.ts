export interface Todo {
    id: string;
    title: string;
    completed: boolean;
    categoryId?: string | null;
    createdAt: number;
    updatedAt: number;
}
