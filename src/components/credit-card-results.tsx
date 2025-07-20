"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Star, CreditCard, DollarSign, Percent, Clock } from "lucide-react"

interface CreditCardRecommendation {
  rank: number;
  cardName: string;
  issuer: string;
  overallScore: number;
  matchScore: number;
  annualFee: { amount: number; waived: boolean };
  aprRange: { purchase: string };
  rewards: {
    structure: string;
    categories: Array<{ category: string; rate: number; cap?: string }>;
    baseRate: number;
    estimatedAnnualValue: number;
  };
  verificationDetails: {
    confidenceScore: number;
    sources: string[];
    lastVerified: string;
    dataQuality: string;
  };
}

interface CreditCardResultsProps {
  results?: {
    success: boolean;
    summary: string;
    searchMetadata: {
      totalSearches: number;
      sourcesConsulted: string[];
      dataFreshness: string;
      lastUpdated: string;
    };
    recommendedCards: CreditCardRecommendation[];
    alternativeCards?: CreditCardRecommendation[];
    userAnalysis: {
      creditProfile: string;
      spendingPattern: string;
      recommendations: string[];
    };
    responseMetadata: {
      provider: string;
      processingTime: string;
      timestamp: string;
    };
  };
  isLoading?: boolean;
  error?: string;
}

export function CreditCardResults({ results, isLoading, error }: CreditCardResultsProps) {
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Searching for the best credit cards...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <CreditCard className="h-16 w-16 text-muted-foreground mx-auto" />
          <div>
            <h3 className="text-lg font-semibold">Find Your Perfect Credit Card</h3>
            <p className="text-muted-foreground">Ask a question in the sidebar to get personalized recommendations</p>
          </div>
        </div>
      </div>
    );
  }

  const renderCreditCard = (card: CreditCardRecommendation, index: number) => (
    <Card key={`${card.rank}-${index}`} className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="secondary">#{card.rank}</Badge>
              {card.cardName}
            </CardTitle>
            <CardDescription className="mt-1">
              {card.issuer} • Match Score: {card.matchScore}%
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-current text-yellow-500" />
              <span className="font-semibold">{card.overallScore}</span>
            </div>
            <Badge variant={card.verificationDetails.dataQuality === "high" ? "default" : "secondary"}>
              {card.verificationDetails.dataQuality} quality
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium">
              <DollarSign className="h-4 w-4" />
              Annual Fee
            </div>
            <p className="text-lg font-semibold">
              {card.annualFee.amount === 0 ? "No Fee" : `$${card.annualFee.amount}`}
              {card.annualFee.waived && <Badge variant="outline" className="ml-2">Waived</Badge>}
            </p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Percent className="h-4 w-4" />
              APR Range
            </div>
            <p className="text-sm text-muted-foreground">{card.aprRange.purchase}</p>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <h4 className="font-medium">Rewards Structure</h4>
          <Badge variant="outline" className="capitalize">{card.rewards.structure}</Badge>
          
          <div className="space-y-1">
            {card.rewards.categories.map((category, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span>{category.category}</span>
                <span className="font-medium">
                  {category.rate}%{category.cap && ` (${category.cap})`}
                </span>
              </div>
            ))}
            <div className="flex justify-between text-sm">
              <span>Everything else</span>
              <span className="font-medium">{card.rewards.baseRate}%</span>
            </div>
          </div>
          
          <div className="pt-2">
            <p className="text-sm font-medium">
              Estimated annual value: <span className="text-green-600">${card.rewards.estimatedAnnualValue}</span>
            </p>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Verification Details
          </h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Confidence: {card.verificationDetails.confidenceScore}/10</p>
            <p>Sources: {card.verificationDetails.sources.join(", ")}</p>
            <p>Last verified: {new Date(card.verificationDetails.lastVerified).toLocaleDateString()}</p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button className="w-full">Apply Now</Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="flex-1 p-6 space-y-6 overflow-auto">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Credit Card Recommendations</h2>
        <p className="text-muted-foreground">{results.summary}</p>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{results.searchMetadata.totalSearches} searches performed</span>
          <span>•</span>
          <span>Data from: {results.searchMetadata.sourcesConsulted.join(", ")}</span>
          <span>•</span>
          <span>{results.searchMetadata.dataFreshness}</span>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Recommended Cards</h3>
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {results.recommendedCards.map((card, index) => renderCreditCard(card, index))}
        </div>
      </div>

      {results.alternativeCards && results.alternativeCards.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Alternative Options</h3>
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {results.alternativeCards.map((card, index) => renderCreditCard(card, index))}
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Your Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="font-medium">Credit Profile: </span>
            <Badge variant="outline">{results.userAnalysis.creditProfile}</Badge>
          </div>
          <div>
            <span className="font-medium">Spending Pattern: </span>
            <span className="text-muted-foreground">{results.userAnalysis.spendingPattern}</span>
          </div>
          <div className="space-y-1">
            <span className="font-medium">Recommendations:</span>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {results.userAnalysis.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground text-center">
        Powered by {results.responseMetadata.provider} • Processed in {results.responseMetadata.processingTime}
      </div>
    </div>
  );
}