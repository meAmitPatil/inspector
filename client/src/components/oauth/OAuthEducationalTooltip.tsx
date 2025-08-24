import { HelpCircle, ExternalLink, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface OAuthConcept {
  id: string;
  term: string;
  shortDescription: string;
  detailedExplanation: string;
  analogy?: string;
  learnMoreUrl?: string;
  relatedConcepts?: string[];
}

// OAuth education content
export const OAUTH_CONCEPTS: Record<string, OAuthConcept> = {
  authorization_server: {
    id: "authorization_server",
    term: "Authorization Server",
    shortDescription: "The service that handles OAuth permissions",
    detailedExplanation: "The authorization server is responsible for authenticating users and issuing access tokens. It's the 'bouncer' that decides who gets access to what resources.",
    analogy: "Like a hotel front desk that checks your ID and gives you a key card to your room",
    learnMoreUrl: "https://datatracker.ietf.org/doc/html/rfc6749#section-1.1"
  },
  access_token: {
    id: "access_token",
    term: "Access Token",
    shortDescription: "Your temporary permission to access the server",
    detailedExplanation: "An access token is a credential that allows applications to access protected resources on behalf of a user. It's like a temporary pass that proves you have permission.",
    analogy: "Like a wristband at a concert that proves you paid and can access the venue",
    relatedConcepts: ["refresh_token", "bearer_token"]
  },
  refresh_token: {
    id: "refresh_token", 
    term: "Refresh Token",
    shortDescription: "Used to get new access tokens when they expire",
    detailedExplanation: "Refresh tokens are long-lived credentials used to obtain new access tokens when the current ones expire, without requiring user re-authentication.",
    analogy: "Like having a renewable library card - when it expires, you can renew it without proving your identity again",
    relatedConcepts: ["access_token"]
  },
  authorization_code: {
    id: "authorization_code",
    term: "Authorization Code", 
    shortDescription: "Temporary code exchanged for access tokens",
    detailedExplanation: "A temporary code returned by the authorization server after the user grants permission. This code is exchanged for access tokens in a secure server-to-server communication.",
    analogy: "Like a claim ticket you get at a coat check - you exchange it for the actual item (access token)",
    relatedConcepts: ["access_token", "pkce"]
  },
  pkce: {
    id: "pkce",
    term: "PKCE",
    shortDescription: "Security extension that prevents code interception",
    detailedExplanation: "Proof Key for Code Exchange is a security extension that prevents authorization code interception attacks by using cryptographically random keys.",
    analogy: "Like adding a secret handshake to ensure the person claiming the coat check ticket is really you"
  },
  client_registration: {
    id: "client_registration",
    term: "Client Registration",
    shortDescription: "Registering your app with the OAuth server", 
    detailedExplanation: "The process of registering your application with the authorization server to get a client ID and establish trust.",
    analogy: "Like registering your business to get a business license - it proves you're legitimate"
  },
  scope: {
    id: "scope",
    term: "OAuth Scopes",
    shortDescription: "Specific permissions you're requesting",
    detailedExplanation: "Scopes define the specific permissions an application is requesting. They limit what the access token can be used for.",
    analogy: "Like specifying which rooms in a hotel you need access to - lobby, gym, pool, but not other guest rooms"
  }
};

interface OAuthEducationalTooltipProps {
  concept: string;
  children?: React.ReactNode;
  variant?: "simple" | "detailed";
  trigger?: "hover" | "click";
}

export const OAuthEducationalTooltip = ({ 
  concept, 
  children,
  variant = "simple",
  trigger = "hover"
}: OAuthEducationalTooltipProps) => {
  const conceptData = OAUTH_CONCEPTS[concept];
  
  if (!conceptData) {
    return children || null;
  }

  if (variant === "simple") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {children || (
              <Button variant="ghost" size="sm" className="h-auto p-1">
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-2">
              <div className="font-medium">{conceptData.term}</div>
              <div className="text-sm">{conceptData.shortDescription}</div>
              {conceptData.analogy && (
                <div className="text-xs text-muted-foreground italic">
                  💡 {conceptData.analogy}
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm" className="h-auto p-1">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-96" side="top">
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{conceptData.term}</h3>
                <Badge variant="secondary" className="text-xs">
                  OAuth Concept
                </Badge>
              </div>
              
              {/* Description */}
              <p className="text-sm text-muted-foreground">
                {conceptData.detailedExplanation}
              </p>
              
              {/* Analogy */}
              {conceptData.analogy && (
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">
                      💡 Think of it like:
                    </span>
                  </div>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mt-1 italic">
                    {conceptData.analogy}
                  </p>
                </div>
              )}
              
              {/* Related Concepts */}
              {conceptData.relatedConcepts && conceptData.relatedConcepts.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Related concepts:</div>
                  <div className="flex flex-wrap gap-1">
                    {conceptData.relatedConcepts.map(relatedId => {
                      const related = OAUTH_CONCEPTS[relatedId];
                      return related ? (
                        <Badge key={relatedId} variant="outline" className="text-xs">
                          {related.term}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
              
              {/* Learn More Link */}
              {conceptData.learnMoreUrl && (
                <div className="pt-2 border-t">
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    onClick={() => window.open(conceptData.learnMoreUrl, "_blank")}
                  >
                    Learn more about {conceptData.term}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

interface ConceptBadgeProps {
  concept: string;
  className?: string;
}

export const OAuthConceptBadge = ({ concept, className }: ConceptBadgeProps) => {
  const conceptData = OAUTH_CONCEPTS[concept];
  
  if (!conceptData) return null;

  return (
    <OAuthEducationalTooltip concept={concept} variant="simple">
      <Badge variant="outline" className={`cursor-help ${className}`}>
        {conceptData.term} 
        <HelpCircle className="h-3 w-3 ml-1" />
      </Badge>
    </OAuthEducationalTooltip>
  );
};