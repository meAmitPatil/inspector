import { CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepStatus {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "current" | "complete" | "error";
  icon?: string;
  estimatedTime?: string;
}

interface OAuthStepIndicatorProps {
  steps: StepStatus[];
  orientation?: "horizontal" | "vertical";
  showEstimatedTime?: boolean;
  className?: string;
}

export const OAuthStepIndicator = ({
  steps,
  orientation = "horizontal",
  showEstimatedTime = false,
  className
}: OAuthStepIndicatorProps) => {
  const isHorizontal = orientation === "horizontal";

  return (
    <div 
      className={cn(
        "flex gap-4",
        isHorizontal ? "flex-row items-center" : "flex-col",
        className
      )}
    >
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center gap-4">
          {/* Step Circle and Content */}
          <div className={cn(
            "flex items-center gap-3",
            !isHorizontal && "w-full"
          )}>
            {/* Status Icon */}
            <div className={cn(
              "flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-200",
              {
                "border-green-500 bg-green-50 dark:bg-green-950/20": step.status === "complete",
                "border-primary bg-primary/10 ring-2 ring-primary/20": step.status === "current",
                "border-red-500 bg-red-50 dark:bg-red-950/20": step.status === "error",
                "border-muted-foreground/30 bg-muted/30": step.status === "pending"
              }
            )}>
              {step.status === "complete" && (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              )}
              {step.status === "current" && (
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
              )}
              {step.status === "error" && (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              {step.status === "pending" && (
                <Circle className="w-5 h-5 text-muted-foreground" />
              )}
            </div>

            {/* Step Content */}
            <div className={cn(
              "flex-1",
              !isHorizontal && "min-w-0"
            )}>
              <div className="flex items-center gap-2">
                {step.icon && (
                  <span className="text-lg">{step.icon}</span>
                )}
                <h3 className={cn(
                  "font-medium text-sm",
                  {
                    "text-green-700 dark:text-green-300": step.status === "complete",
                    "text-foreground": step.status === "current",
                    "text-red-700 dark:text-red-300": step.status === "error",
                    "text-muted-foreground": step.status === "pending"
                  }
                )}>
                  {step.title}
                </h3>
              </div>
              
              {step.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {step.description}
                </p>
              )}
              
              {showEstimatedTime && step.estimatedTime && (
                <p className="text-xs text-muted-foreground/70 mt-1">
                  {step.estimatedTime}
                </p>
              )}
            </div>
          </div>

          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div className={cn(
              "bg-border",
              isHorizontal 
                ? "h-0.5 w-8 flex-shrink-0" 
                : "w-0.5 h-8 ml-5 flex-shrink-0"
            )} />
          )}
        </div>
      ))}
    </div>
  );
};