type ToastOptions = { title?: string; description?: string; variant?: "default"|"destructive" };

export function useToast() {
  return { 
    toast: (_opts: ToastOptions) => void 0,
    toasts: []
  };
}

export function toast(opts: ToastOptions) {
  console.log('Toast:', opts);
}

export default useToast;
