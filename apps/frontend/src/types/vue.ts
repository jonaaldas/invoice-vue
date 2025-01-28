declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $toaster: (title: string, description: string, type?: "destructive" | "default") => void;
  }
}
