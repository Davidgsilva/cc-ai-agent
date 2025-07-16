"use client";

import { Card, CardBody, CardHeader, Input, Select, SelectItem, Chip, Button, Divider } from "@heroui/react";
import { motion } from "framer-motion";
import { usePreferences } from "../../hooks/usePreferences";

const creditScoreRanges = [
  { key: "excellent", label: "Excellent (740+)" },
  { key: "good", label: "Good (670-739)" },
  { key: "fair", label: "Fair (580-669)" },
  { key: "poor", label: "Poor (Below 580)" },
  { key: "unknown", label: "Don't know" }
];

const incomeRanges = [
  { key: "under-30k", label: "Under $30,000" },
  { key: "30k-50k", label: "$30,000 - $50,000" },
  { key: "50k-75k", label: "$50,000 - $75,000" },
  { key: "75k-100k", label: "$75,000 - $100,000" },
  { key: "100k-150k", label: "$100,000 - $150,000" },
  { key: "150k-plus", label: "$150,000+" }
];

const spendingCategories = [
  { key: "dining", label: "Dining & Restaurants" },
  { key: "groceries", label: "Groceries" },
  { key: "gas", label: "Gas & Transportation" },
  { key: "travel", label: "Travel" },
  { key: "online", label: "Online Shopping" },
  { key: "other", label: "Other Purchases" }
];

const commonBenefits = [
  "Cash back",
  "Travel rewards",
  "No annual fee",
  "Airport lounge access",
  "Purchase protection",
  "Extended warranty",
  "Travel insurance",
  "Price protection",
  "Concierge service",
  "Priority boarding"
];

export default function PreferencesPanel() {
  const {
    preferences,
    updatePreferences,
    updateSpendingCategory,
    addCurrentCard,
    removeCurrentCard,
    addGoal,
    removeGoal,
    clearPreferences
  } = usePreferences();

  const handleBenefitToggle = (benefit) => {
    const current = preferences.preferredBenefits || [];
    const updated = current.includes(benefit)
      ? current.filter(b => b !== benefit)
      : [...current, benefit];
    
    updatePreferences({ preferredBenefits: updated });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full overflow-y-auto p-4 space-y-6"
    >
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center w-full">
            <h3 className="text-lg font-semibold">Your Profile</h3>
            <Button
              size="sm"
              variant="light"
              color="danger"
              onPress={clearPreferences}
            >
              Reset
            </Button>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <Select
            label="Credit Score Range"
            placeholder="Select your credit score range"
            selectedKeys={preferences.creditScore ? [preferences.creditScore] : []}
            onSelectionChange={(keys) => 
              updatePreferences({ creditScore: Array.from(keys)[0] || '' })
            }
          >
            {creditScoreRanges.map((range) => (
              <SelectItem key={range.key} value={range.key}>
                {range.label}
              </SelectItem>
            ))}
          </Select>

          <Select
            label="Annual Income"
            placeholder="Select your income range"
            selectedKeys={preferences.annualIncome ? [preferences.annualIncome] : []}
            onSelectionChange={(keys) => 
              updatePreferences({ annualIncome: Array.from(keys)[0] || '' })
            }
          >
            {incomeRanges.map((range) => (
              <SelectItem key={range.key} value={range.key}>
                {range.label}
              </SelectItem>
            ))}
          </Select>

          <Input
            label="Maximum Annual Fee"
            placeholder="e.g., $95"
            value={preferences.maxAnnualFee}
            onChange={(e) => updatePreferences({ maxAnnualFee: e.target.value })}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Monthly Spending</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <p className="text-sm text-default-500">
            Enter your approximate monthly spending in each category:
          </p>
          {spendingCategories.map((category) => (
            <Input
              key={category.key}
              label={category.label}
              placeholder="$0"
              type="number"
              value={preferences.spendingCategories[category.key]?.toString() || ''}
              onChange={(e) => updateSpendingCategory(category.key, e.target.value)}
              startContent="$"
            />
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Preferred Benefits</h3>
        </CardHeader>
        <CardBody>
          <div className="flex flex-wrap gap-2">
            {commonBenefits.map((benefit) => (
              <Chip
                key={benefit}
                variant={preferences.preferredBenefits?.includes(benefit) ? "solid" : "bordered"}
                color={preferences.preferredBenefits?.includes(benefit) ? "primary" : "default"}
                className="cursor-pointer"
                onPress={() => handleBenefitToggle(benefit)}
              >
                {benefit}
              </Chip>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Current Cards</h3>
        </CardHeader>
        <CardBody className="space-y-2">
          {preferences.currentCards.map((card, index) => (
            <div key={index} className="flex justify-between items-center p-2 bg-content2 rounded">
              <span className="text-sm">{card}</span>
              <Button
                size="sm"
                variant="light"
                color="danger"
                onPress={() => removeCurrentCard(index)}
              >
                Remove
              </Button>
            </div>
          ))}
          <Input
            placeholder="Add a current credit card..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                addCurrentCard(e.target.value.trim());
                e.target.value = '';
              }
            }}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Financial Goals</h3>
        </CardHeader>
        <CardBody className="space-y-2">
          {preferences.goals.map((goal, index) => (
            <div key={index} className="flex justify-between items-center p-2 bg-content2 rounded">
              <span className="text-sm">{goal}</span>
              <Button
                size="sm"
                variant="light"
                color="danger"
                onPress={() => removeGoal(index)}
              >
                Remove
              </Button>
            </div>
          ))}
          <Input
            placeholder="Add a financial goal..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                addGoal(e.target.value.trim());
                e.target.value = '';
              }
            }}
          />
        </CardBody>
      </Card>
    </motion.div>
  );
}