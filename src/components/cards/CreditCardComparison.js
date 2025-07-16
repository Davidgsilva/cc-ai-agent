"use client";

import { Card, CardBody, CardHeader, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Button } from "@heroui/react";
import { motion } from "framer-motion";
import { formatCurrency, formatPercentage } from "../../utils/helpers";

export default function CreditCardComparison({ cards = [] }) {
  if (!cards || cards.length === 0) {
    return null;
  }

  const features = [
    { key: "annualFee", label: "Annual Fee" },
    { key: "apr", label: "APR Range" },
    { key: "cashbackRate", label: "Cashback Rate" },
    { key: "signupBonus", label: "Sign-up Bonus" },
    { key: "creditScore", label: "Credit Score Needed" },
    { key: "foreignTransaction", label: "Foreign Transaction Fee" }
  ];

  const renderFeatureValue = (card, feature) => {
    const value = card[feature.key];
    
    if (!value) return "Not specified";
    
    switch (feature.key) {
      case "annualFee":
        return value === "0" || value === 0 ? "No annual fee" : formatCurrency(value);
      case "apr":
        return typeof value === "object" ? `${formatPercentage(value.min)} - ${formatPercentage(value.max)}` : formatPercentage(value);
      case "cashbackRate":
        return typeof value === "object" ? `${formatPercentage(value.base)} base, up to ${formatPercentage(value.max)}` : formatPercentage(value);
      case "foreignTransaction":
        return value === "0" || value === 0 ? "No fee" : formatPercentage(value);
      default:
        return value;
    }
  };

  const getBenefitColor = (benefit) => {
    const colorMap = {
      "No annual fee": "success",
      "Travel rewards": "primary",
      "Cash back": "secondary",
      "Premium benefits": "warning"
    };
    return colorMap[benefit] || "default";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Credit Card Comparison</h3>
        <Button size="sm" variant="light">
          Export Comparison
        </Button>
      </div>

      {/* Mobile-friendly card layout */}
      <div className="md:hidden space-y-4">
        {cards.map((card, index) => (
          <Card key={index} className="w-full">
            <CardHeader>
              <div className="flex justify-between items-start w-full">
                <div>
                  <h4 className="font-semibold">{card.name}</h4>
                  <p className="text-sm text-default-500">{card.issuer}</p>
                </div>
                <Chip
                  color={card.recommended ? "success" : "default"}
                  variant={card.recommended ? "solid" : "bordered"}
                  size="sm"
                >
                  {card.recommended ? "Recommended" : "Option"}
                </Chip>
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              {features.map((feature) => (
                <div key={feature.key} className="flex justify-between">
                  <span className="text-sm font-medium">{feature.label}:</span>
                  <span className="text-sm text-right">{renderFeatureValue(card, feature)}</span>
                </div>
              ))}
              
              {card.benefits && (
                <div className="pt-2">
                  <p className="text-sm font-medium mb-2">Key Benefits:</p>
                  <div className="flex flex-wrap gap-1">
                    {card.benefits.slice(0, 3).map((benefit, i) => (
                      <Chip
                        key={i}
                        size="sm"
                        variant="flat"
                        color={getBenefitColor(benefit)}
                      >
                        {benefit}
                      </Chip>
                    ))}
                    {card.benefits.length > 3 && (
                      <Chip size="sm" variant="flat">
                        +{card.benefits.length - 3} more
                      </Chip>
                    )}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Desktop table layout */}
      <div className="hidden md:block">
        <Table aria-label="Credit card comparison table">
          <TableHeader>
            <TableColumn>CARD</TableColumn>
            {features.map((feature) => (
              <TableColumn key={feature.key}>{feature.label.toUpperCase()}</TableColumn>
            ))}
            <TableColumn>BENEFITS</TableColumn>
          </TableHeader>
          <TableBody>
            {cards.map((card, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-semibold">{card.name}</span>
                    <span className="text-small text-default-500">{card.issuer}</span>
                    {card.recommended && (
                      <Chip color="success" size="sm" className="mt-1 w-fit">
                        Recommended
                      </Chip>
                    )}
                  </div>
                </TableCell>
                {features.map((feature) => (
                  <TableCell key={feature.key}>
                    {renderFeatureValue(card, feature)}
                  </TableCell>
                ))}
                <TableCell>
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {card.benefits?.slice(0, 2).map((benefit, i) => (
                      <Chip
                        key={i}
                        size="sm"
                        variant="flat"
                        color={getBenefitColor(benefit)}
                      >
                        {benefit}
                      </Chip>
                    ))}
                    {card.benefits && card.benefits.length > 2 && (
                      <Chip size="sm" variant="flat">
                        +{card.benefits.length - 2}
                      </Chip>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
}