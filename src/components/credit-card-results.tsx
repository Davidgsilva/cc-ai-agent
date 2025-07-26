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

  const renderCreditCard = (card: CreditCardRecommendation, index: number) => (
    <Card key={`${card.rank}-${index}`} className="w-full overflow-hidden">
      <CardContent className="p-6">
        {/* Two Column Layout */}
        <div>
          {/* Left Column: Visual and CTA */}
          <div className="space-y-4">
            {/* Credit Card Visual */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">#{card.rank}</Badge>
                  <CreditCard className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold mb-1">{card.cardName}</h3>
                <p className="text-xs opacity-90">{card.issuer}</p>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <CreditCard className="h-24 w-24" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.floor(card.overallScore / 2) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="font-semibold">{card.overallScore}/10</span>
            </div>

            <Button variant="outline" size="sm" className="w-full justify-start">
              <ExternalLink className="h-4 w-4 mr-2" />
              Rates & Fees
            </Button>

            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
              Apply Now
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              on {card.issuer}'s application
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="font-medium text-sm">Annual Fee:</span>
                <span className="font-semibold">
                  {card.annualFee.amount === 0 ? "$0" : `$${card.annualFee.amount}`}
                  {card.annualFee.waived && <Badge variant="outline" className="ml-2 text-xs">Waived</Badge>}
                </span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-1">
                  <span className="font-medium text-sm">Rewards Rate:</span>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </div>
                <span className="font-semibold">
                  {card.rewards.categories.length > 0 
                    ? `${Math.min(...card.rewards.categories.map(c => c.rate))}%–${Math.max(...card.rewards.categories.map(c => c.rate))}% Cashback`
                    : `${card.rewards.baseRate}% Cashback`
                  }
                </span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-1">
                  <span className="font-medium text-sm">Intro Offer:</span>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </div>
                <span className="font-semibold text-green-600">
                  ${card.rewards.estimatedAnnualValue}
                </span>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <span className="font-medium text-sm">Recommended Credit Score:</span>
                <div className="text-right">
                  <span className="font-semibold">630–850</span>
                  <p className="text-xs text-muted-foreground">
                    Average – Excellent
                  </p>
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs text-blue-600">
                    See your approval odds
                  </Button>
                </div>
              </div>
            </div>
            
            <Badge variant={card.verificationDetails.dataQuality.toLowerCase() === "high" ? "default" : "secondary"} className="w-fit">
              {card.verificationDetails.dataQuality} quality data
            </Badge>
          </div>
        </div>

        <div className="mt-6">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="product-details" className="">
              <AccordionTrigger className="text-left font-medium">
                Product Details
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground mt-1">•</span>
                    <span>Cashback offer: ${card.rewards.estimatedAnnualValue} estimated annual value</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground mt-1">•</span>
                    <span>{card.rewards.structure} rewards structure with {card.rewards.baseRate}% base rate</span>
                  </li>
                  {card.rewards.categories.map((category, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-muted-foreground mt-1">•</span>
                      <span>{category.rate}% on {category.category}{category.cap && ` (${category.cap})`}</span>
                    </li>
                  ))}
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground mt-1">•</span>
                    <span>APR Range: {card.aprRange.purchase}</span>
                  </li>
                </ul>
                
                <Button variant="link" size="sm" className="h-auto p-0 text-blue-600">
                  View Rates and Fees
                </Button>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="our-take" className="">
              <AccordionTrigger className="text-left font-medium">
                Our Take
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <p><strong>Match Score:</strong> {card.matchScore}% compatibility with your profile</p>
                  <p><strong>Data Quality:</strong> {card.verificationDetails.dataQuality} confidence from {card.verificationDetails.sources.length} sources</p>
                  <p><strong>Last Verified:</strong> {new Date(card.verificationDetails.lastVerified).toLocaleDateString()}</p>
                  <p className="text-muted-foreground">
                    This card ranks #{card.rank} based on your spending patterns and credit profile.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );

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