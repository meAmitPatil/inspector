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
  ChevronRight
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

interface OAuthEducationWizardProps {
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

const OAUTH_EDUCATION_STEPS: StepDefinition[] = [
  {
    id: "metadata_discovery",
    title: "Server Capabilities Discovery",
    subtitle: "Understanding what the server supports",
    explanation: "Before we can authenticate, we need to discover what OAuth features and endpoints the server provides. This is like checking what services a hotel offers before booking.",
    technicalDetails: "We fetch the server's OAuth 2.0 authorization server metadata from /.well-known/oauth-authorization-server to understand supported grant types, endpoints, and capabilities.",
    icon: Server,
    whyImportant: "This prevents errors by ensuring we use only features the server supports."
  },
  {
    id: "client_registration", 
    title: "Application Registration",
    subtitle: "Identifying MCP Inspector to the server",
    explanation: "The server needs to know who's requesting access. We register MCP Inspector as a trusted application, similar to how you might register a new app on your phone with a service.",
    technicalDetails: "Either dynamic client registration (DCR) is used to automatically register, or we use pre-configured client credentials provided by the server administrator.",
    icon: Users,
    whyImportant: "This establishes trust and allows the server to track which application is making requests."
  },
  {
    id: "authorization_redirect",
    title: "Authorization Setup", 
    subtitle: "Preparing the permission request",
    explanation: "We create a secure, unique link that takes you to the server's authorization page. This link contains special security codes to prevent tampering.",
    technicalDetails: "An authorization URL is constructed with client_id, scope, redirect_uri, and PKCE parameters (code_challenge). PKCE prevents authorization code interception attacks.",
    icon: Shield,
    userAction: "Click the authorization link to grant permissions",
    whyImportant: "PKCE and state parameters ensure the authorization process cannot be hijacked by malicious actors."
  },
  {
    id: "authorization_code",
    title: "User Authorization",
    subtitle: "Grant permissions to MCP Inspector",
    explanation: "You'll authorize MCP Inspector on the server's official website. After granting permission, you'll receive a temporary authorization code.",
    technicalDetails: "The authorization server authenticates the user and, upon consent, returns an authorization code via redirect. This code is single-use and short-lived.",
    icon: Key,
    userAction: "Complete authorization and paste the code",
    whyImportant: "This ensures only you can authorize access to your account, not MCP Inspector independently."
  },
  {
    id: "token_request",
    title: "Token Exchange",
    subtitle: "Converting permission to access credentials", 
    explanation: "We exchange the temporary authorization code for long-term access credentials. This happens securely between servers, not in your browser.",
    technicalDetails: "A server-to-server POST request exchanges the authorization code + PKCE code verifier for access tokens and refresh tokens. The code is consumed and becomes invalid.",
    icon: Zap,
    whyImportant: "Server-to-server exchange prevents access tokens from being exposed to browsers or network traffic."
  },
  {
    id: "complete",
    title: "Authentication Complete",
    subtitle: "Ready to access your server securely",
    explanation: "Perfect! MCP Inspector now has secure, time-limited access to your server. The connection is encrypted and follows OAuth 2.0 security standards.",
    technicalDetails: "Access tokens (for API requests) and refresh tokens (for obtaining new access tokens) are stored securely. All requests now include proper authorization headers.",
    icon: CheckCircle2,
    whyImportant: "You maintain control - tokens can be revoked, and MCP Inspector only has the permissions you explicitly granted."
  }
];

export const OAuthEducationWizard = ({ 
  serverUrl, 
  flowState, 
  updateFlowState, 
  proceedToNextStep 
}: OAuthEducationWizardProps) => {
  const [expandedDetails, setExpandedDetails] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  
  const currentStepIndex = OAUTH_EDUCATION_STEPS.findIndex(step => step.id === flowState.oauthStep);
  const currentStep = OAUTH_EDUCATION_STEPS[currentStepIndex];
  const progressPercentage = ((currentStepIndex + 1) / OAUTH_EDUCATION_STEPS.length) * 100;

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
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header with Context */}
      <div className="text-center space-y-4 pb-6 border-b border-border">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">OAuth 2.0 Setup</h1>
          <p className="text-lg text-muted-foreground">
            Learn OAuth while connecting to your server
          </p>
        </div>
        
        <div className="flex items-center justify-center gap-4 text-sm">
          <Badge variant="outline" className="px-3 py-1">
            Server: {new URL(serverUrl).hostname}
          </Badge>
          <Badge variant="secondary" className="px-3 py-1">
            Step {currentStepIndex + 1} of {OAUTH_EDUCATION_STEPS.length}
          </Badge>
        </div>
        
        {/* Progress Visualization */}
        <div className="space-y-3">
          <Progress value={progressPercentage} className="h-3" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Getting Started</span>
            <span className="font-medium">{Math.round(progressPercentage)}% Complete</span>
            <span>Ready to Use</span>
          </div>
        </div>
      </div>

      {/* Step Timeline */}
      <div className="relative">
        <div className="absolute left-8 top-0 bottom-0 w-px bg-border" />
        
        <div className="space-y-8">
          {OAUTH_EDUCATION_STEPS.map((step, index) => {
            const StepIcon = step.icon;
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isPending = index > currentStepIndex;
            
            return (
              <div key={step.id} className="relative flex gap-6">
                {/* Timeline Node */}
                <div className={`flex-shrink-0 w-16 h-16 rounded-full border-4 flex items-center justify-center z-10 transition-all duration-300 ${
                  isCompleted 
                    ? "border-green-500 bg-green-500 text-white shadow-lg" 
                    : isCurrent 
                    ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                    : "border-border bg-background text-muted-foreground"
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <StepIcon className="w-6 h-6" />
                  )}
                </div>

                {/* Step Content */}
                <Card className={`flex-1 transition-all duration-300 ${
                  isCurrent ? "ring-2 ring-primary shadow-lg" : isPending ? "opacity-60" : ""
                }`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-3">
                          {step.title}
                          {isCurrent && (
                            <Badge className="text-xs">Current Step</Badge>
                          )}
                        </CardTitle>
                        <p className="text-muted-foreground">{step.subtitle}</p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Main Explanation */}
                    <p className="text-sm leading-relaxed">
                      {step.explanation}
                    </p>
                    
                    {/* Why This Matters */}
                    <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                          Why this matters
                        </p>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          {step.whyImportant}
                        </p>
                      </div>
                    </div>

                    {/* Technical Details (Collapsible) */}
                    <Collapsible 
                      open={expandedDetails === step.id} 
                      onOpenChange={(open) => setExpandedDetails(open ? step.id : null)}
                    >
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="p-0 h-auto text-muted-foreground hover:text-foreground">
                          <div className="flex items-center gap-2">
                            {expandedDetails === step.id ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                            <span className="text-sm">Technical Details</span>
                          </div>
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pt-3">
                        <div className="p-3 bg-muted/50 border border-border rounded-lg">
                          <p className="text-sm text-muted-foreground font-mono leading-relaxed">
                            {step.technicalDetails}
                          </p>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Step-specific Interactive Content */}
                    {isCurrent && renderStepInteraction(step)}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-6 border-t border-border">
        <Button
          variant="outline"
          onClick={() => {
            const prevStep = OAUTH_EDUCATION_STEPS[Math.max(0, currentStepIndex - 1)];
            updateFlowState({ oauthStep: prevStep.id });
          }}
          disabled={currentStepIndex === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous Step
        </Button>
        
        {flowState.oauthStep !== "complete" && (
          <Button
            onClick={proceedToNextStep}
            disabled={flowState.isInitiatingAuth || (flowState.oauthStep === "authorization_code" && !flowState.authorizationCode.trim())}
            size="lg"
          >
            {flowState.isInitiatingAuth ? (
              "Processing..."
            ) : (
              <>
                {currentStep.userAction || "Continue"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
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
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300 mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-medium">Discovery Complete</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Authorization Endpoint:</span>
                  <p className="text-green-600 dark:text-green-400 font-mono text-xs mt-1">
                    {new URL(flowState.oauthMetadata.authorization_endpoint).pathname}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Token Endpoint:</span>
                  <p className="text-green-600 dark:text-green-400 font-mono text-xs mt-1">
                    {new URL(flowState.oauthMetadata.token_endpoint).pathname}
                  </p>
                </div>
              </div>
            </div>
          );
        }
        return (
          <div className="mt-4 flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Discovering server capabilities...</span>
          </div>
        );

      case "authorization_redirect":
        if (flowState.authorizationUrl) {
          return (
            <div className="mt-4 space-y-4">
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">Secure Authorization Link</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(flowState.authorizationUrl!)}
                  >
                    {copiedUrl ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => window.open(flowState.authorizationUrl!, "_blank")}
                    className="flex-shrink-0"
                  >
                    Open Authorization Page
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Opens in a new tab for security
                  </p>
                </div>
              </div>
            </div>
          );
        }
        return (
          <div className="mt-4 flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Generating secure authorization parameters...</span>
          </div>
        );

      case "authorization_code":
        return (
          <div className="mt-4 space-y-4">
            <div className="space-y-3">
              <Label htmlFor="authCode" className="text-sm font-medium">
                Authorization Code
              </Label>
              <Input
                id="authCode"
                value={flowState.authorizationCode}
                onChange={(e) => updateFlowState({ 
                  authorizationCode: e.target.value,
                  validationError: null 
                })}
                placeholder="Paste the authorization code from your browser"
                className="font-mono"
              />
              {flowState.validationError && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {flowState.validationError}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                After authorizing in the new tab, you'll receive a code to paste here
              </p>
            </div>
          </div>
        );

      case "complete":
        if (flowState.oauthTokens) {
          return (
            <div className="mt-4 space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <h4 className="font-medium text-green-900 dark:text-green-100 mb-3">
                  Connection Established
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Token Type:</span>
                    <p className="text-green-700 dark:text-green-300">{flowState.oauthTokens.token_type}</p>
                  </div>
                  <div>
                    <span className="font-medium">Valid For:</span>
                    <p className="text-green-700 dark:text-green-300">{Math.floor(flowState.oauthTokens.expires_in / 3600)} hours</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  What you learned
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• How OAuth 2.0 protects your credentials</li>
                  <li>• Why server discovery prevents configuration errors</li>
                  <li>• How PKCE prevents authorization code attacks</li>
                  <li>• Why tokens are exchanged server-to-server</li>
                </ul>
              </div>
            </div>
          );
        }
        break;

      default:
        return (
          <div className="mt-4 flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Processing step...</span>
          </div>
        );
    }
  }
};