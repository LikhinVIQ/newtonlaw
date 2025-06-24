"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const initialBalance = 2000;
const initialMonthlyContribution = 500;
const initialAnnualInterestRate = 0.05;
const initialYears = 10;

function formatCurrency(value: number) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

function calculateInvestmentGrowth(
  initial: number,
  monthly: number,
  rate: number,
  years: number,
) {
  const results = [];
  let balance = initial;

  for (let month = 1; month <= years * 12; month++) {
    balance += monthly;
    balance *= 1 + rate / 12;
    if (month % 12 === 0) {
      results.push({
        year: month / 12,
        value: parseFloat(balance.toFixed(2)),
      });
    }
  }

  return results;
}

export default function SimulationF() {
  const [balance, setBalance] = useState(initialBalance);
  const [monthlyContribution, setMonthlyContribution] = useState(
    initialMonthlyContribution,
  );
  const [interestRate, setInterestRate] = useState(initialAnnualInterestRate);
  const [years, setYears] = useState(initialYears);

  const results = calculateInvestmentGrowth(
    balance,
    monthlyContribution,
    interestRate,
    years,
  );

  return (
    <div className="grid gap-4 p-4">
      <Card>
        <CardContent className="grid gap-2 p-4">
          <label>
            Initial Balance
            <input
              type="number"
              value={balance}
              onChange={(e) => setBalance(Number(e.target.value))}
              className="w-full border p-1 rounded"
            />
          </label>
          <label>
            Monthly Contribution
            <input
              type="number"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(Number(e.target.value))}
              className="w-full border p-1 rounded"
            />
          </label>
          <label>
            Annual Interest Rate (%)
            <input
              type="number"
              value={interestRate * 100}
              onChange={(e) => setInterestRate(Number(e.target.value) / 100)}
              className="w-full border p-1 rounded"
            />
          </label>
          <label>
            Years
            <input
              type="number"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full border p-1 rounded"
            />
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-2 p-4">
          <h2 className="text-xl font-bold">Projection</h2>
          <ul className="grid gap-1">
            {results.map((result) => (
              <li key={result.year}>
                Year {result.year}: {formatCurrency(result.value)}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Button
        onClick={() => {
          setBalance(initialBalance);
          setMonthlyContribution(initialMonthlyContribution);
          setInterestRate(initialAnnualInterestRate);
          setYears(initialYears);
        }}
      >
        Reset
      </Button>
    </div>
  );
}

// Export both default and named version
