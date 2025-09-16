type ToastOptions = { title?: string; description?: string; variant?: "default"|"destructive" };
export function useToast() {
  return { toast: (_opts: ToastOptions) => void 0 };
}
export default useToast;
