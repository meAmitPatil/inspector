import { useState } from "react";
import { 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  ExternalLink,
  Copy,
  Check,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { OAuthFlowState, OAuthStep } from "@/lib/oauth-flow-types";

interface OAuthWizardSimpleProps {
  serverUrl: string;
  flowState: OAuthFlowState;
  updateFlowState: (updates: Partial<OAuthFlowState>) => void;
  proceedToNextStep: () => Promise<void>;
}

const STEP_TITLES = {
  metadata_discovery: { title: "🔍 Server Discovery", desc: "Finding OAuth settings" },
  client_registration: { title: "📋 App Registration", desc: "Registering MCP Inspector" },
  authorization_redirect: { title: "🔗 Permission Setup", desc: "Preparing authorization" },
  authorization_code: { title: "✋ Get Permission", desc: "Authorize in your browser" },
  token_request: { title: "🔑 Exchange Token", desc: "Getting access credentials" },
  complete: { title: "🎉 All Set!", desc: "Authentication complete" }
};

const OAUTH_STEPS: OAuthStep[] = ["metadata_discovery", "client_registration", "authorization_redirect", "authorization_code", "token_request", "complete"];

export const OAuthWizardSimple = ({ 
  serverUrl, 
  flowState, 
  updateFlowState, 
  proceedToNextStep 
}: OAuthWizardSimpleProps) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  
  const currentStepIndex = OAUTH_STEPS.findIndex(step => step === flowState.oauthStep);
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

  const currentStepInfo = STEP_TITLES[flowState.oauthStep];

  return (
    <TooltipProvider>
      <div className="w-full max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-4">
            <h2 className="text-2xl font-bold">OAuth Setup</h2>
            <Badge variant="secondary">
              Step {currentStepIndex + 1} of {OAUTH_STEPS.length}
            </Badge>
          </div>
          
          <p className="text-muted-foreground">
            Setting up secure authentication with{" "}
            <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
              {new URL(serverUrl).hostname}
            </span>
          </p>
          
          {/* Progress */}
          <div className="space-y-2">
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {Math.round(progressPercentage)}% complete
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center space-x-2">
          {OAUTH_STEPS.map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all ${
                index < currentStepIndex
                  ? "border-green-500 bg-green-500 text-white"
                  : index === currentStepIndex
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-muted bg-background text-muted-foreground"
              }`}>
                {index < currentStepIndex ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </div>
              {index < OAUTH_STEPS.length - 1 && (
                <div className={`w-8 h-0.5 mx-1 ${
                  index < currentStepIndex ? "bg-green-500" : "bg-muted"
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Current Step */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  {currentStepInfo.title}
                </h3>
                <p className="text-muted-foreground">
                  {currentStepInfo.desc}
                </p>
              </div>

              {/* Step Content */}
              {renderStepContent()}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              const prevStep = OAUTH_STEPS[Math.max(0, currentStepIndex - 1)];
              updateFlowState({ oauthStep: prevStep });
            }}
            disabled={currentStepIndex === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          {flowState.oauthStep !== "complete" && (
            <Button
              onClick={proceedToNextStep}
              disabled={flowState.isInitiatingAuth || (flowState.oauthStep === "authorization_code" && !flowState.authorizationCode.trim())}
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
    </TooltipProvider>
  );

  function renderStepContent() {
    switch (flowState.oauthStep) {
      case "metadata_discovery":
        if (flowState.oauthMetadata) {
          return (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Server found and ready!</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Found OAuth endpoints and capabilities
              </div>
            </div>
          );
        }
        return (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            <p className="text-sm">Discovering OAuth capabilities...</p>
          </div>
        );

      case "client_registration":
        if (flowState.oauthClientInfo) {
          return (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">App registered successfully!</span>
              </div>
              <div className="text-sm text-muted-foreground">
                MCP Inspector is now registered with the server
              </div>
            </div>
          );
        }
        return (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            <p className="text-sm">Registering MCP Inspector...</p>
          </div>
        );

      case "authorization_redirect":
        if (flowState.authorizationUrl) {
          return (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Authorization link ready!</span>
              </div>
              
              <Button
                size="lg"
                onClick={() => window.open(flowState.authorizationUrl!, "_blank")}
                className="w-full max-w-sm mx-auto"
              >
                Open Authorization Page
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
              
              <p className="text-sm text-muted-foreground">
                You'll be redirected back automatically after authorization
              </p>
            </div>
          );
        }
        return (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            <p className="text-sm">Creating secure authorization link...</p>
          </div>
        );

      case "authorization_code":
        return (
          <div className="space-y-4">
            <div className="space-y-4">
              <div className="text-lg">✋</div>
              <p className="text-sm">
                After authorizing in your browser, paste the authorization code here:
              </p>
              
              <div className="space-y-2">
                <Label htmlFor="authCode">Authorization Code</Label>
                <Input
                  id="authCode"
                  value={flowState.authorizationCode}
                  onChange={(e) => updateFlowState({ 
                    authorizationCode: e.target.value,
                    validationError: null 
                  })}
                  placeholder="Paste authorization code here"
                  className="font-mono text-sm"
                />
                {flowState.validationError && (
                  <p className="text-xs text-red-600">
                    {flowState.validationError}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case "token_request":
        if (flowState.oauthTokens) {
          return (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Tokens received!</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Successfully exchanged authorization code for access tokens
              </div>
            </div>
          );
        }
        return (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            <p className="text-sm">Exchanging code for access tokens...</p>
          </div>
        );

      case "complete":
        return (
          <div className="space-y-4">
            <div className="text-6xl">🎉</div>
            <div>
              <h3 className="text-xl font-semibold text-green-600 mb-2">
                Authentication Successful!
              </h3>
              <p className="text-muted-foreground">
                MCP Inspector can now securely connect to your server
              </p>
            </div>
            
            {flowState.oauthTokens && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="text-sm space-y-1">
                  <div><strong>Token Type:</strong> {flowState.oauthTokens.token_type}</div>
                  <div><strong>Expires In:</strong> {flowState.oauthTokens.expires_in} seconds</div>
                  {flowState.oauthTokens.scope && (
                    <div><strong>Scope:</strong> {flowState.oauthTokens.scope}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            <p className="text-sm">Processing...</p>
          </div>
        );
    }
  }
};