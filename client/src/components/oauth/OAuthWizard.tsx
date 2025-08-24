import { useState } from "react";
import { 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  ArrowLeft, 
  HelpCircle,
  ExternalLink,
  Copy,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { OAuthFlowState, OAuthStep } from "@/lib/oauth-flow-types";

interface OAuthWizardProps {
  serverUrl: string;
  flowState: OAuthFlowState;
  updateFlowState: (updates: Partial<OAuthFlowState>) => void;
  proceedToNextStep: () => Promise<void>;
}

interface StepConfig {
  id: OAuthStep;
  title: string;
  description: string;
  explanation: string;
  icon?: string;
  estimatedTime?: string;
}

const OAUTH_STEPS: StepConfig[] = [
  {
    id: "metadata_discovery",
    title: "Server Discovery",
    description: "Finding OAuth settings",
    explanation: "We're checking what OAuth features your server supports and how to connect to it.",
    icon: "🔍",
    estimatedTime: "~5 seconds"
  },
  {
    id: "client_registration", 
    title: "App Registration",
    description: "Registering MCP Inspector",
    explanation: "We're telling the server about MCP Inspector so it knows what permissions to grant.",
    icon: "📋",
    estimatedTime: "~3 seconds"
  },
  {
    id: "authorization_redirect",
    title: "Permission Setup", 
    description: "Preparing authorization",
    explanation: "We're creating a secure link where you can grant permissions to MCP Inspector.",
    icon: "🔗",
    estimatedTime: "~2 seconds"
  },
  {
    id: "authorization_code",
    title: "Get Permission",
    description: "Authorize in your browser",
    explanation: "You'll grant permissions to MCP Inspector through the server's authorization page.",
    icon: "✋", 
    estimatedTime: "~30 seconds"
  },
  {
    id: "token_request",
    title: "Exchange Token",
    description: "Getting access credentials", 
    explanation: "We're exchanging your permission for secure access tokens that let us connect.",
    icon: "🔑",
    estimatedTime: "~3 seconds"
  },
  {
    id: "complete",
    title: "All Set!",
    description: "Authentication complete",
    explanation: "Perfect! MCP Inspector can now securely connect to your server.",
    icon: "🎉",
    estimatedTime: "Done"
  }
];

export const OAuthWizard = ({ 
  serverUrl, 
  flowState, 
  updateFlowState, 
  proceedToNextStep 
}: OAuthWizardProps) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  
  const currentStepIndex = OAUTH_STEPS.findIndex(step => step.id === flowState.oauthStep);
  const currentStep = OAUTH_STEPS[currentStepIndex];
  const progressPercentage = ((currentStepIndex + 1) / OAUTH_STEPS.length) * 100;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const isStepComplete = (stepIndex: number) => {
    return stepIndex < currentStepIndex || flowState.oauthStep === "complete";
  };

  const isStepCurrent = (stepIndex: number) => {
    return stepIndex === currentStepIndex;
  };

  return (
    <TooltipProvider>
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground">
                OAuth Setup Wizard
              </h2>
              <Badge variant="secondary" className="text-sm">
                Step {currentStepIndex + 1} of {OAUTH_STEPS.length}
              </Badge>
            </div>
            
            <p className="text-muted-foreground mb-4">
              Setting up secure authentication with <span className="font-medium">{serverUrl}</span>
            </p>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress value={progressPercentage} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Getting started</span>
                <span>{Math.round(progressPercentage)}% complete</span>
                <span>Ready to use!</span>
              </div>
            </div>
          </div>

          {/* Step Navigation - Horizontal timeline */}
          <div className="flex items-center justify-between mb-8 px-4">
            {OAUTH_STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                {/* Step Circle */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                  isStepCurrent(index)
                    ? "border-primary bg-primary text-primary-foreground"
                    : isStepComplete(index)
                    ? "border-green-500 bg-green-500 text-white"
                    : "border-muted-foreground bg-background text-muted-foreground"
                }`}>
                  {isStepComplete(index) ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-bold">{index + 1}</span>
                  )}
                </div>
                
                {/* Connector Line */}
                {index < OAUTH_STEPS.length - 1 && (
                  <div className={`w-8 h-0.5 mx-2 ${
                    isStepComplete(index) ? "bg-green-500" : "bg-muted"
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Current Step Content */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl">{currentStep?.icon}</div>
              <div>
                <h3 className="text-xl font-semibold">{currentStep?.title}</h3>
                <p className="text-muted-foreground">{currentStep?.description}</p>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{currentStep?.explanation}</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Step-specific content will be rendered here */}
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                {renderStepContent()}
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => updateFlowState({ oauthStep: "metadata_discovery" })}
              disabled={currentStepIndex === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <div className="flex gap-2">
              {flowState.oauthStep !== "complete" && (
                <Button
                  onClick={proceedToNextStep}
                  disabled={flowState.isInitiatingAuth}
                  className="min-w-32"
                >
                  {flowState.isInitiatingAuth ? (
                    "Processing..."
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );

  function renderStepContent() {
    switch (flowState.oauthStep) {
      case "metadata_discovery":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-sm">Discovering OAuth capabilities...</span>
            </div>
            
            {flowState.oauthMetadata && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-medium">Server found and ready!</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex flex-col">
                    <span className="font-medium mb-1">Authorization URL:</span>
                    <code className="text-xs bg-background p-2 rounded break-all">
                      {flowState.oauthMetadata.authorization_endpoint}
                    </code>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium mb-1">Token URL:</span>
                    <code className="text-xs bg-background p-2 rounded break-all">
                      {flowState.oauthMetadata.token_endpoint}
                    </code>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case "authorization_redirect":
        return (
          <div className="space-y-4">
            {flowState.authorizationUrl ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600 mb-3">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-medium">Authorization link ready!</span>
                </div>
                
                <div className="bg-background border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Your authorization link:</span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(flowState.authorizationUrl!)}
                      >
                        {copiedUrl ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => window.open(flowState.authorizationUrl!, "_blank")}
                      >
                        Open <ExternalLink className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                  <code className="text-xs text-muted-foreground break-all">
                    {flowState.authorizationUrl}
                  </code>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    What happens next?
                  </h4>
                  <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>1. Click "Open" to visit the authorization page</li>
                    <li>2. Sign in to your account if prompted</li>
                    <li>3. Grant permissions to MCP Inspector</li>
                    <li>4. You'll be redirected back here automatically</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-sm">Creating secure authorization link...</span>
              </div>
            )}
          </div>
        );

      case "complete":
        return (
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold text-green-600">
              Authentication Successful!
            </h3>
            <p className="text-muted-foreground">
              MCP Inspector is now connected and ready to use with {serverUrl}
            </p>
            
            {flowState.oauthTokens && (
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Token Type:</span>
                    <Badge variant="secondary" className="ml-2">
                      {flowState.oauthTokens.token_type}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Expires In:</span>
                    <span className="ml-2">{flowState.oauthTokens.expires_in}s</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-sm">Processing step...</span>
          </div>
        );
    }
  }
};