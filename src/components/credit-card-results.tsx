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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Star, CreditCard, Info, ExternalLink } from "lucide-react"

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
  console.log('🏦 [CreditCardResults] Component props:', { results, isLoading, error });
  console.log('🏦 [CreditCardResults] Results type:', typeof results);
  console.log('🏦 [CreditCardResults] Has results:', !!results);
  console.log('🏦 [CreditCardResults] Has recommendedCards:', !!results?.recommendedCards);
  
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

  const renderCreditCard = (card: CreditCardRecommendation, index: number) => {
    const rewardRateText = card.rewards.categories.length > 0 
      ? `${Math.min(...card.rewards.categories.map(c => c.rate))}%–${Math.max(...card.rewards.categories.map(c => c.rate))}% Cashback`
      : `${card.rewards.baseRate}% Cashback`;

    return (
      <AccordionItem key={`${card.rank}-${index}`} value={`card-${card.rank}-${index}`} className="border rounded-lg">
        <AccordionTrigger className="hover:no-underline p-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              {/* Card Rank Badge */}
              <Badge variant="secondary" className="shrink-0">#{card.rank}</Badge>
              
              {/* Card Info */}
              <div className="text-left">
                <h3 className="font-semibold text-base">{card.cardName}</h3>
                <p className="text-sm text-muted-foreground">{card.issuer}</p>
              </div>
            </div>
            
            {/* Key Metrics */}
            <div className="flex items-center gap-6 text-sm">
              <div className="text-right">
                <p className="font-semibold">{card.annualFee.amount === 0 ? "$0" : `$${card.annualFee.amount}`} Annual Fee</p>
                <p className="text-muted-foreground">{rewardRateText}</p>
              </div>
              
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-3 w-3 ${i < Math.floor(card.overallScore / 2) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="font-semibold text-sm">{card.overallScore}/10</span>
              </div>
            </div>
          </div>
        </AccordionTrigger>
        
        <AccordionContent className="px-4 pb-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column: Card Visual & Actions */}
            <div className="space-y-4">
              {/* Credit Card Visual */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs">#{card.rank}</Badge>
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-sm mb-1">{card.cardName}</h4>
                  <p className="text-xs opacity-90">{card.issuer}</p>
                </div>
                <div className="absolute -right-2 -bottom-2 opacity-10">
                  <CreditCard className="h-16 w-16" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  Apply Now
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Rates & Fees
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  on {card.issuer}'s secure site
                </p>
              </div>
            </div>

            {/* Right Column: Details */}
            <div className="space-y-4">
              {/* Key Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="font-medium text-sm">Annual Fee:</span>
                  <span className="font-semibold">
                    {card.annualFee.amount === 0 ? "$0" : `$${card.annualFee.amount}`}
                    {card.annualFee.waived && <Badge variant="outline" className="ml-2 text-xs">Waived</Badge>}
                  </span>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="font-medium text-sm">Rewards Rate:</span>
                  <span className="font-semibold text-sm">{rewardRateText}</span>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="font-medium text-sm">Est. Annual Value:</span>
                  <span className="font-semibold text-green-600">
                    ${card.rewards.estimatedAnnualValue}
                  </span>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <span className="font-medium text-sm">Credit Score:</span>
                  <div className="text-right">
                    <span className="font-semibold text-sm">630–850</span>
                    <p className="text-xs text-muted-foreground">Average – Excellent</p>
                  </div>
                </div>
              </div>
              
              {/* Match Score */}
              <div className="bg-muted rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Match Score</span>
                  <span className="text-sm font-semibold">{card.matchScore}%</span>
                </div>
                <div className="w-full bg-background rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all" 
                    style={{ width: `${card.matchScore}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on your spending patterns and credit profile
                </p>
              </div>
            </div>
          </div>

          {/* Expandable Details */}
          <div className="mt-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="rewards-details" className="border-0">
                <AccordionTrigger className="text-left font-medium py-2">
                  Rewards Details
                </AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-sm mb-2">Earning Structure</h5>
                      <ul className="space-y-1 text-sm">
                        {card.rewards.categories.map((category, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-muted-foreground mt-1">•</span>
                            <span>{category.rate}% on {category.category}{category.cap && ` (${category.cap})`}</span>
                          </li>
                        ))}
                        <li className="flex items-start gap-2">
                          <span className="text-muted-foreground mt-1">•</span>
                          <span>{card.rewards.baseRate}% on all other purchases</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm mb-2">Program Details</h5>
                      <ul className="space-y-1 text-sm">
                        <li><strong>Structure:</strong> {card.rewards.structure}</li>
                        <li><strong>APR Range:</strong> {card.aprRange.purchase}</li>
                        <li><strong>Est. Annual Value:</strong> ${card.rewards.estimatedAnnualValue}</li>
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="data-quality" className="border-0">
                <AccordionTrigger className="text-left font-medium py-2">
                  Data Quality & Sources
                </AccordionTrigger>
                <AccordionContent className="">
                  <div className="text-sm space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={card.verificationDetails.dataQuality.toLowerCase() === "high" ? "default" : "secondary"} className="">
                        {card.verificationDetails.dataQuality} Quality
                      </Badge>
                      <span className="text-muted-foreground">
                        {card.verificationDetails.confidenceScore}% confidence
                      </span>
                    </div>
                    <p><strong>Sources:</strong> {card.verificationDetails.sources.join(", ")}</p>
                    <p><strong>Last Verified:</strong> {new Date(card.verificationDetails.lastVerified).toLocaleDateString()}</p>
                    <p className="text-muted-foreground">
                      This card ranks #{card.rank} based on your specific requirements and spending patterns.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-auto">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Credit Card Recommendations</h2>
        <p className="text-sm">{results.summary}</p>
        
        <div className="flex items-center gap-4 text-sm">
          <span>{results.searchMetadata.totalSearches} searches performed</span>
          <span>•</span>
          <span>Data from: {results.searchMetadata.sourcesConsulted.join(", ")}</span>
          <span>•</span>
          <span>{results.searchMetadata.dataFreshness}</span>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Recommended Cards</h3>
        <Accordion type="single" collapsible className="w-full space-y-2">
          {results.recommendedCards.map((card, index) => renderCreditCard(card, index))}
        </Accordion>
      </div>

      {results.alternativeCards && results.alternativeCards.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Alternative Options</h3>
          <Accordion type="single" collapsible className="w-full space-y-2">
            {results.alternativeCards.map((card, index) => renderCreditCard(card, index))}
          </Accordion>
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
            <span className="text-xs">{results.userAnalysis.spendingPattern}</span>
          </div>
          <div className="space-y-1">
            <span className="font-medium">Recommendations:</span>
            <ul className="list-disc list-inside space-y-1 text-xs">
              {results.userAnalysis.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="text-xs text-center">
        Processed in {results.responseMetadata.processingTime}
      </div>
    </div>
  );
}