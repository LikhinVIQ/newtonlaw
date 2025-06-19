import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface LoadingModalProps {
  open: boolean;
  title?: string;
  description?: string;
}

export default function LoadingModal({ 
  open, 
  title = "AI is Reviewing Your Answer",
  description = "This may take a few moments..." 
}: LoadingModalProps) {
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center justify-center py-6">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-gray-600 text-sm text-center">{description}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
