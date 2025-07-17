"use client";

import { Card, CardHeader, CardBody, Image, Chip, Button } from "@heroui/react";
import { motion } from "framer-motion";
import { formatCurrency, formatPercentage } from "../../utils/helpers";

export default function CreditCardHero({ cards = [] }) {
  if (!cards || cards.length === 0) {
    return null;
  }

  const getBenefitColor = (benefit) => {
    const colorMap = {
      "No annual fee": "success",
      "Travel rewards": "primary", 
      "Cash back": "secondary",
      "Premium benefits": "warning"
    };
    return colorMap[benefit] || "default";
  };

  const formatAnnualFee = (fee) => {
    if (fee === "0" || fee === 0) return "No annual fee";
    return formatCurrency(fee);
  };

  const formatAPR = (apr) => {
    if (typeof apr === "object") {
      return `${formatPercentage(apr.min)} - ${formatPercentage(apr.max)}`;
    }
    return formatPercentage(apr);
  };

  const formatCashback = (rate) => {
    if (typeof rate === "object") {
      return `${formatPercentage(rate.base)} base, up to ${formatPercentage(rate.max)}`;
    }
    return formatPercentage(rate);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {cards.map((card, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="py-4 h-full hover:shadow-lg transition-shadow">
            <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
              <div className="flex justify-between items-start w-full mb-2">
                <div className="flex-1">
                  <p className="text-tiny uppercase font-bold text-default-500">{card.issuer}</p>
                  <h4 className="font-bold text-large">{card.name}</h4>
                </div>
                {card.recommended && (
                  <Chip color="success" variant="solid" size="sm">
                    Recommended
                  </Chip>
                )}
              </div>
              
              <div className="space-y-1 w-full">
                <div className="flex justify-between items-center">
                  <small className="text-default-500">Annual Fee</small>
                  <small className="font-semibold">{formatAnnualFee(card.annualFee)}</small>
                </div>
                <div className="flex justify-between items-center">
                  <small className="text-default-500">APR</small>
                  <small className="font-semibold">{formatAPR(card.apr)}</small>
                </div>
                {card.cashbackRate && (
                  <div className="flex justify-between items-center">
                    <small className="text-default-500">Cashback</small>
                    <small className="font-semibold">{formatCashback(card.cashbackRate)}</small>
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardBody className="overflow-visible py-2">
              {card.image ? (
                <Image
                  alt={`${card.name} credit card`}
                  className="object-cover rounded-xl"
                  src={card.image}
                  width={270}
                  height={180}
                  fallbackSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjcwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NzI4NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNyZWRpdCBDYXJkPC90ZXh0Pjwvc3ZnPg=="
                />
              ) : (
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl h-[180px] w-full flex items-center justify-center">
                  <div className="text-white text-center">
                    <h5 className="font-bold text-lg">{card.name}</h5>
                    <p className="text-sm opacity-90">{card.issuer}</p>
                  </div>
                </div>
              )}
              
              {card.benefits && card.benefits.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium">Key Benefits:</p>
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
              
              {card.signupBonus && (
                <div className="mt-3 p-2 bg-warning-50 rounded-lg border border-warning-200">
                  <p className="text-xs font-medium text-warning-800">Sign-up Bonus</p>
                  <p className="text-sm text-warning-700">{card.signupBonus}</p>
                </div>
              )}
              
              <div className="mt-4 flex gap-2">
                <Button 
                  color="primary" 
                  variant="solid" 
                  size="sm" 
                  className="flex-1"
                  as="a"
                  href={card.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Apply Now
                </Button>
                <Button 
                  variant="bordered" 
                  size="sm"
                  className="flex-1"
                  as="a"
                  href={card.searchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn More
                </Button>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}