export interface Todo {
  id: number;
  title: string;
  completed: number; // SQLite stores booleans as 0 or 1
}
