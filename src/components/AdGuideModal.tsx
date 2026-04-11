import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle2 } from "lucide-react";
import { getAdBlockInstructions } from "@/utils/deviceDetection";
import { useMemo } from "react";

interface AdGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDismissPermanently: () => void;
}

const AdGuideModal = ({ isOpen, onClose, onDismissPermanently }: AdGuideModalProps) => {
  const instructions = useMemo(() => getAdBlockInstructions(), []);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Fix Ads & Improve Streaming 🚀
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground leading-relaxed">
            To reduce ads and improve your streaming experience on <strong className="text-foreground">{instructions.platform}</strong>, follow these steps:
          </p>

          <ol className="space-y-3">
            {instructions.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3 group">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold border border-primary/20 group-hover:bg-primary/20 transition-colors">
                  {i + 1}
                </span>
                <div className="flex items-center gap-2 pt-0.5">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-foreground">{step.text}</span>
                </div>
              </li>
            ))}
          </ol>

          {instructions.fallback && (
            <div className="bg-muted/50 rounded-lg p-3 border border-border">
              <p className="text-xs text-muted-foreground leading-relaxed">
                💡 {instructions.fallback}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Button onClick={onClose} className="w-full">
            Got it
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={onDismissPermanently}
          >
            Don't show again
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdGuideModal;
