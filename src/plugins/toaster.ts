import { useToast } from "../components/ui/toast/use-toast";
const { toast } = useToast();

declare global {
  interface Window {
    toaster: (title: string, description: string, type?: "destructive" | "default") => void;
  }
}

export default {
  install: (app, options) => {
    window.toaster = function (title: string, description: string, type: "destructive" | "default" = "default") {
      toast({
        title,
        description,
      });
    };
  },
};
