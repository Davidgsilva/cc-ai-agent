"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader, Input, Select, SelectItem, Button, Divider } from "@heroui/react";
import { motion } from "framer-motion";
import { formatCurrency, calculateRewardValue, getSpendingTotal } from "../../utils/helpers";

const rewardCards = [
  {
    id: "chase-freedom-unlimited",
    name: "Chase Freedom Unlimited",
    rates: { base: 1.5, dining: 3, drugstore: 3 }
  },
  {
    id: "chase-sapphire-preferred",
    name: "Chase Sapphire Preferred", 
    rates: { base: 1, dining: 2, travel: 2 }
  },
  {
    id: "capital-one-venture",
    name: "Capital One Venture",
    rates: { base: 2 }
  },
  {
    id: "amex-gold",
    name: "American Express Gold",
    rates: { base: 1, dining: 4, groceries: 4 }
  }
];

export default function RewardCalculator() {
  const [selectedCard, setSelectedCard] = useState("");
  const [spending, setSpending] = useState({
    dining: "",
    groceries: "",
    gas: "",
    travel: "",
    other: ""
  });

  const handleSpendingChange = (category, value) => {
    setSpending(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const calculateRewards = () => {
    if (!selectedCard) return 0;
    
    const card = rewardCards.find(c => c.id === selectedCard);
    if (!card) return 0;
    
    let totalRewards = 0;
    
    Object.entries(spending).forEach(([category, amount]) => {
      const monthlySpend = parseFloat(amount) || 0;
      const annualSpend = monthlySpend * 12;
      const rate = card.rates[category] || card.rates.base;
      totalRewards += calculateRewardValue(annualSpend, rate);
    });
    
    return totalRewards;
  };

  const totalMonthlySpending = getSpendingTotal(spending);
  const annualRewards = calculateRewards();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full">
        <CardHeader>
          <h3 className="text-lg font-semibold">Reward Calculator</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <Select
            label="Select Credit Card"
            placeholder="Choose a card to compare"
            selectedKeys={selectedCard ? [selectedCard] : []}
            onSelectionChange={(keys) => setSelectedCard(Array.from(keys)[0] || "")}
          >
            {rewardCards.map((card) => (
              <SelectItem key={card.id} value={card.id}>
                {card.name}
              </SelectItem>
            ))}
          </Select>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Monthly Dining"
              placeholder="$500"
              value={spending.dining}
              onChange={(e) => handleSpendingChange("dining", e.target.value)}
              startContent="$"
              type="number"
            />
            <Input
              label="Monthly Groceries"
              placeholder="$400"
              value={spending.groceries}
              onChange={(e) => handleSpendingChange("groceries", e.target.value)}
              startContent="$"
              type="number"
            />
            <Input
              label="Monthly Gas"
              placeholder="$200"
              value={spending.gas}
              onChange={(e) => handleSpendingChange("gas", e.target.value)}
              startContent="$"
              type="number"
            />
            <Input
              label="Monthly Travel"
              placeholder="$300"
              value={spending.travel}
              onChange={(e) => handleSpendingChange("travel", e.target.value)}
              startContent="$"
              type="number"
            />
            <Input
              label="Other Monthly Spending"
              placeholder="$600"
              value={spending.other}
              onChange={(e) => handleSpendingChange("other", e.target.value)}
              startContent="$"
              type="number"
              className="md:col-span-2"
            />
          </div>

          <Divider />

          <div className="bg-content2 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Monthly Spending:</span>
              <span>{formatCurrency(totalMonthlySpending)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Annual Spending:</span>
              <span>{formatCurrency(totalMonthlySpending * 12)}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold text-primary">
              <span>Estimated Annual Rewards:</span>
              <span>{formatCurrency(annualRewards)}</span>
            </div>
          </div>

          {selectedCard && (
            <div className="text-sm text-default-500 p-3 bg-warning-50 rounded-lg">
              <p className="font-medium mb-1">Reward Structure:</p>
              {(() => {
                const card = rewardCards.find(c => c.id === selectedCard);
                return (
                  <ul className="space-y-1">
                    {Object.entries(card.rates).map(([category, rate]) => (
                      <li key={category}>
                        • {category === 'base' ? 'All purchases' : category}: {rate}% back
                      </li>
                    ))}
                  </ul>
                );
              })()}
            </div>
          )}

          <Button
            color="primary"
            variant="flat"
            className="w-full"
            onPress={() => {
              setSpending({
                dining: "",
                groceries: "",
                gas: "",
                travel: "",
                other: ""
              });
              setSelectedCard("");
            }}
          >
            Reset Calculator
          </Button>
        </CardBody>
      </Card>
    </motion.div>
  );
}