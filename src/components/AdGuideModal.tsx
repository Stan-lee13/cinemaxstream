import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, Smartphone, Wifi, Globe, CheckCircle2 } from "lucide-react";

interface AdGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDismissPermanently: () => void;
}

const steps = [
  { icon: Smartphone, text: "Go to your phone Settings" },
  { icon: Wifi, text: 'Tap "Connections"' },
  { icon: Globe, text: 'Tap "More Connection Settings"' },
  { icon: Shield, text: 'Open "Private DNS"' },
  { icon: CheckCircle2, text: 'Select "Private DNS provider hostname"' },
  { icon: Globe, text: "Enter: dns.adguard.com" },
  { icon: CheckCircle2, text: "Tap Save" },
];

const AdGuideModal = ({ isOpen, onClose, onDismissPermanently }: AdGuideModalProps) => {
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
            To reduce ads and improve your streaming experience, follow these steps:
          </p>

          <ol className="space-y-3">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <li key={i} className="flex items-start gap-3 group">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold border border-primary/20 group-hover:bg-primary/20 transition-colors">
                    {i + 1}
                  </span>
                  <div className="flex items-center gap-2 pt-0.5">
                    <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm text-foreground">{step.text}</span>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="bg-muted/50 rounded-lg p-3 border border-border">
            <p className="text-xs text-muted-foreground leading-relaxed">
              💡 If it doesn't work on your device, you can install the{" "}
              <a
                href="https://adguard.com/en/adguard-android/overview.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 hover:text-primary/80"
              >
                AdGuard app
              </a>{" "}
              and turn it on for the same effect.
            </p>
          </div>
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
