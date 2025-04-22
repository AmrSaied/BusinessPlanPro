import React, { useState } from "react";
import { useLocation, Link } from "wouter";
import AdminLayout from "../../components/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  CircleDollarSign,
  Percent,
  CreditCard,
  PackagePlus,
  ArrowRight,
} from "lucide-react";

const PricesPage = () => {
  const [, navigate] = useLocation();

  const pricingModules = [
    {
      title: "Base Prices",
      description: "Manage base pricing for different flight routes and travel classes.",
      icon: <DollarSign className="h-6 w-6" />,
      href: "/admin/prices/base",
      color: "bg-blue-100 dark:bg-blue-900",
      iconColor: "text-blue-700 dark:text-blue-300",
    },
    {
      title: "Additional Services",
      description: "Configure extra services like baggage, seat selection, and meals.",
      icon: <PackagePlus className="h-6 w-6" />,
      href: "/admin/prices/services",
      color: "bg-green-100 dark:bg-green-900",
      iconColor: "text-green-700 dark:text-green-300",
    },
    {
      title: "Discounts & Promotions",
      description: "Create and manage promotional codes and special offers.",
      icon: <Percent className="h-6 w-6" />,
      href: "/admin/prices/discounts",
      color: "bg-purple-100 dark:bg-purple-900",
      iconColor: "text-purple-700 dark:text-purple-300",
    },
    {
      title: "Currency Settings",
      description: "Configure supported currencies and exchange rates.",
      icon: <CreditCard className="h-6 w-6" />,
      href: "/admin/prices/currency",
      color: "bg-orange-100 dark:bg-orange-900",
      iconColor: "text-orange-700 dark:text-orange-300",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pricing Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage all pricing aspects of your flight booking platform from this dashboard.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {pricingModules.map((module) => (
            <Card key={module.title} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-md ${module.color}`}>
                    <div className={module.iconColor}>{module.icon}</div>
                  </div>
                  <CardTitle className="text-xl">{module.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-foreground/80 min-h-[2.5rem]">
                  {module.description}
                </CardDescription>
              </CardContent>
              <CardFooter className="pt-0">
                <Button
                  variant="ghost"
                  className="w-full justify-between"
                  onClick={() => navigate(module.href)}
                >
                  <span>Manage</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Price Strategy Overview</CardTitle>
            <CardDescription>
              Your pricing framework combines multiple components to create the final price offered to customers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-md bg-muted/50">
                <h3 className="font-semibold text-base mb-2">How Pricing Works</h3>
                <ol className="list-decimal ml-5 space-y-2 text-sm">
                  <li>
                    <span className="font-medium">Base Price:</span> The starting point for each route and travel class
                  </li>
                  <li>
                    <span className="font-medium">Additional Services:</span> Optional or required add-ons that can be selected
                  </li>
                  <li>
                    <span className="font-medium">Discounts & Promotions:</span> Reduce the final price based on specific criteria
                  </li>
                  <li>
                    <span className="font-medium">Currency Conversion:</span> Automatically convert prices to the customer's preferred currency
                  </li>
                </ol>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">
                  Example Price Calculation:
                </p>
                <div className="font-mono bg-background border p-3 rounded-md">
                  <div>Base Price (Economy LAX to JFK) = $250.00</div>
                  <div>+ Extra Baggage = $50.00</div>
                  <div>+ Priority Boarding = $20.00</div>
                  <div>= Subtotal: $320.00</div>
                  <div>- Discount (15% SUMMER2025) = -$48.00</div>
                  <div className="border-t mt-1 pt-1 font-bold">Final Price = $272.00</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default PricesPage;