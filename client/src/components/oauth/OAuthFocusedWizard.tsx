import { useState } from "react";
import { 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  ExternalLink,
  Copy,
  Check,
  Info,
  Server,
  Shield,
  Key,
  Users,
  Zap,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { OAuthFlowState, OAuthStep } from "@/lib/oauth-flow-types";

interface OAuthFocusedWizardProps {
  serverUrl: string;
  flowState: OAuthFlowState;
  updateFlowState: (updates: Partial<OAuthFlowState>) => void;
  proceedToNextStep: () => Promise<void>;
}

interface StepDefinition {
  id: OAuthStep;
  title: string;
  subtitle: string;
  explanation: string;
  technicalDetails: string;
  icon: typeof Server;
  userAction?: string;
  whyImportant: string;
}

const getOAuthEducationSteps = (serverUrl: string): StepDefinition[] => [
  {
    id: "metadata_discovery",
    title: "Server Discovery",
    subtitle: "Finding OAuth capabilities",
    explanation: "We're checking what OAuth features your server supports. This ensures we use only features the server provides.",
    technicalDetails: `Making a GET request to ${serverUrl}/.well-known/oauth-authorization-server (RFC 8414 OAuth Discovery). This standard endpoint tells us: authorization & token endpoint URLs, supported scopes, PKCE capability, response types, and security features. Every compliant OAuth server publishes this metadata so clients can configure themselves automatically.`,
    icon: Server,
    whyImportant: "Prevents configuration errors and compatibility issues."
  },
  {
    id: "client_registration", 
    title: "App Registration",
    subtitle: "Identifying MCP Inspector",
    explanation: "We're registering MCP Inspector with the server so it knows who's requesting access.",
    technicalDetails: "Using dynamic client registration (DCR) or pre-configured client credentials to establish trust.",
    icon: Users,
    whyImportant: "Establishes trust and enables the server to track application access."
  },
  {
    id: "authorization_redirect",
    title: "Authorization Setup", 
    subtitle: "Creating secure permission link",
    explanation: "We're generating a secure link that takes you to the server's authorization page.",
    technicalDetails: "Creating authorization URL with client_id, scope, redirect_uri, and PKCE security parameters.",
    icon: Shield,
    userAction: "Open authorization link",
    whyImportant: "PKCE parameters prevent authorization code interception attacks."
  },
  {
    id: "authorization_code",
    title: "User Authorization",
    subtitle: "Grant permissions",
    explanation: "You'll authorize MCP Inspector and receive a temporary code to paste here.",
    technicalDetails: "The authorization server returns a single-use, short-lived authorization code after user consent.",
    icon: Key,
    userAction: "Paste authorization code",
    whyImportant: "Only you can authorize access - MCP Inspector can't do this independently."
  },
  {
    id: "token_request",
    title: "Token Exchange",
    subtitle: "Converting to access credentials", 
    explanation: "We're securely exchanging your authorization code for long-term access tokens.",
    technicalDetails: "Server-to-server POST request exchanges authorization code + PKCE verifier for access and refresh tokens.",
    icon: Zap,
    whyImportant: "Server-to-server exchange keeps access tokens secure from browsers and networks."
  },
  {
    id: "complete",
    title: "Setup Complete",
    subtitle: "Ready to use",
    explanation: "Perfect! MCP Inspector now has secure access to your server with the permissions you granted.",
    technicalDetails: "Access tokens for API requests and refresh tokens for renewals are securely stored.",
    icon: CheckCircle2,
    whyImportant: "You maintain control - tokens can be revoked and have limited scope."
  }
];

export const OAuthFocusedWizard = ({ 
  serverUrl, 
  flowState, 
  updateFlowState, 
  proceedToNextStep 
}: OAuthFocusedWizardProps) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [showCompletedSteps, setShowCompletedSteps] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  
  const OAUTH_EDUCATION_STEPS = getOAuthEducationSteps(serverUrl);
  const currentStepIndex = OAUTH_EDUCATION_STEPS.findIndex(step => step.id === flowState.oauthStep);
  const currentStep = OAUTH_EDUCATION_STEPS[currentStepIndex];
  const progressPercentage = ((currentStepIndex + 1) / OAUTH_EDUCATION_STEPS.length) * 100;
  const completedSteps = OAUTH_EDUCATION_STEPS.slice(0, currentStepIndex);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Compact Header */}
      <div className="text-center space-y-4 pb-4 border-b border-border">
        <div className="flex items-center justify-center gap-4">
          <h2 className="text-2xl font-bold">OAuth Setup</h2>
          <Badge variant="secondary">
            {currentStepIndex + 1} / {OAUTH_EDUCATION_STEPS.length}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-sm text-muted-foreground">
            {Math.round(progressPercentage)}% complete • {new URL(serverUrl).hostname}
          </p>
        </div>
      </div>

      {/* Completed Steps (Collapsible) */}
      {completedSteps.length > 0 && (
        <Collapsible open={showCompletedSteps} onOpenChange={setShowCompletedSteps}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-4 h-auto">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="font-medium">
                  {completedSteps.length} step{completedSteps.length !== 1 ? 's' : ''} completed
                </span>
              </div>
              {showCompletedSteps ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="space-y-2 p-4 bg-green-50/50 dark:bg-green-950/10 rounded-lg border border-green-200/50 dark:border-green-800/50">
              {completedSteps.map((step) => {
                const StepIcon = step.icon;
                return (
                  <div key={step.id} className="flex items-center gap-3 p-2">
                    <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{step.title}</p>
                      <p className="text-xs text-muted-foreground">{step.subtitle}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Current Step - FOCUSED */}
      <Card className="ring-2 ring-primary shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              <currentStep.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl">{currentStep.title}</CardTitle>
              <p className="text-muted-foreground">{currentStep.subtitle}</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Main Explanation */}
          <p className="text-sm leading-relaxed">
            {currentStep.explanation}
          </p>
          
          {/* Why This Matters */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                Why this matters
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {currentStep.whyImportant}
              </p>
            </div>
          </div>

          {/* Step-specific Interactive Content */}
          {renderStepInteraction(currentStep)}

          {/* Technical Details (Toggle) */}
          <div className="border-t border-border pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="mb-3"
            >
              <div className="flex items-center gap-2">
                {showTechnicalDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>Technical Details</span>
              </div>
            </Button>
            
            {showTechnicalDetails && (
              <div className="p-3 bg-muted/50 border border-border rounded-lg">
                <p className="text-sm text-muted-foreground font-mono leading-relaxed">
                  {currentStep.technicalDetails}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sticky Actions - Always Visible */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border p-4 flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => {
            const prevStep = OAUTH_EDUCATION_STEPS[Math.max(0, currentStepIndex - 1)];
            updateFlowState({ oauthStep: prevStep.id });
          }}
          disabled={currentStepIndex === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        {flowState.oauthStep !== "complete" && (
          <Button
            onClick={proceedToNextStep}
            disabled={
              flowState.isInitiatingAuth || 
              (flowState.oauthStep === "authorization_code" && !flowState.authorizationCode.trim()) ||
              (flowState.oauthStep === "metadata_discovery" && !flowState.oauthMetadata) ||
              (flowState.oauthStep === "client_registration" && !flowState.oauthClientInfo) ||
              (flowState.oauthStep === "authorization_redirect" && !flowState.authorizationUrl)
            }
            size="lg"
            className="min-w-32"
          >
            {flowState.isInitiatingAuth ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {currentStep.userAction || "Continue"}
                <ArrowRight className="h-4 w-4" />
              </div>
            )}
          </Button>
        )}
      </div>
    </div>
  );

  function renderStepInteraction(step: StepDefinition) {
    switch (step.id) {
      case "metadata_discovery":
        if (flowState.oauthMetadata) {
          return (
            <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300 mb-3">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">Server capabilities discovered</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-white/50 dark:bg-black/20 rounded border">
                  <p className="font-medium mb-1">Authorization Endpoint</p>
                  <p className="text-xs font-mono text-muted-foreground">
                    {new URL(flowState.oauthMetadata.authorization_endpoint).pathname}
                  </p>
                </div>
                <div className="p-3 bg-white/50 dark:bg-black/20 rounded border">
                  <p className="font-medium mb-1">Token Endpoint</p>
                  <p className="text-xs font-mono text-muted-foreground">
                    {new URL(flowState.oauthMetadata.token_endpoint).pathname}
                  </p>
                </div>
              </div>
            </div>
          );
        }
        return (
          <div className="flex items-center justify-center gap-3 p-6 bg-muted/50 rounded-lg">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Discovering server capabilities...</span>
          </div>
        );

      case "client_registration":
        if (flowState.oauthClientInfo) {
          return (
            <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300 mb-2">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">MCP Inspector registered successfully</span>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400">
                Client ID: <span className="font-mono">{flowState.oauthClientInfo.client_id}</span>
              </p>
            </div>
          );
        }
        return (
          <div className="flex items-center justify-center gap-3 p-6 bg-muted/50 rounded-lg">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Registering MCP Inspector...</span>
          </div>
        );

      case "authorization_redirect":
        if (flowState.authorizationUrl) {
          return (
            <div className="space-y-4">
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium">Authorization Link Ready</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(flowState.authorizationUrl!)}
                  >
                    {copiedUrl ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                
                <div className="text-center space-y-3">
                  <Button
                    size="lg"
                    onClick={() => window.open(flowState.authorizationUrl!, "_blank")}
                    className="w-full max-w-sm"
                  >
                    Open Authorization Page
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Opens in new tab • You'll be redirected back automatically
                  </p>
                </div>
              </div>
            </div>
          );
        }
        return (
          <div className="flex items-center justify-center gap-3 p-6 bg-muted/50 rounded-lg">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Creating secure authorization link...</span>
          </div>
        );

      case "authorization_code":
        return (
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                Complete authorization in the opened tab, then paste the code here:
              </p>
              
              <div className="space-y-3">
                <Label htmlFor="authCode">Authorization Code</Label>
                <Input
                  id="authCode"
                  value={flowState.authorizationCode}
                  onChange={(e) => updateFlowState({ 
                    authorizationCode: e.target.value,
                    validationError: null 
                  })}
                  placeholder="Paste authorization code from browser"
                  className="font-mono"
                />
                {flowState.validationError && (
                  <p className="text-sm text-red-600 dark:text-red-400">
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
            <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300 mb-2">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">Tokens received successfully</span>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400">
                Access granted for {Math.floor((flowState.oauthTokens.expires_in || 3600) / 3600)} hours
              </p>
            </div>
          );
        }
        return (
          <div className="flex items-center justify-center gap-3 p-6 bg-muted/50 rounded-lg">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Exchanging code for access tokens...</span>
          </div>
        );

      case "complete":
        return (
          <div className="space-y-4">
            <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-green-900 dark:text-green-100 mb-2">
                Setup Complete!
              </h3>
              <p className="text-green-700 dark:text-green-300 mb-4">
                MCP Inspector can now securely access your server
              </p>
              
              {flowState.oauthTokens && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Token Type:</span>
                    <p className="text-green-600 dark:text-green-400">{flowState.oauthTokens.token_type}</p>
                  </div>
                  <div>
                    <span className="font-medium">Valid For:</span>
                    <p className="text-green-600 dark:text-green-400">{Math.floor((flowState.oauthTokens.expires_in || 3600) / 3600)} hours</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                What you learned about OAuth 2.0:
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Server capability discovery prevents errors</li>
                <li>• Client registration establishes trust</li>
                <li>• PKCE prevents code interception attacks</li>
                <li>• Server-to-server token exchange keeps credentials secure</li>
              </ul>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center gap-3 p-6 bg-muted/50 rounded-lg">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Processing step...</span>
          </div>
        );
    }
  }
};