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
  BarChart,
} from "lucide-react";

const PricesPage = () => {
  const [, navigate] = useLocation();

  const pricingModules = [
    {
      title: "Base Prices",
      description: "Manage base pricing for different flight routes and travel classes.",
      icon: <DollarSign className="h-6 w-6" />,
      href: "/admin/prices/base",
      color: "bg-blue-600/20",
      iconColor: "text-blue-400",
    },
    {
      title: "Additional Services",
      description: "Configure extra services like baggage, seat selection, and meals.",
      icon: <PackagePlus className="h-6 w-6" />,
      href: "/admin/prices/services",
      color: "bg-green-600/20",
      iconColor: "text-green-400",
    },
    {
      title: "Discounts & Promotions",
      description: "Create and manage promotional codes and special offers.",
      icon: <Percent className="h-6 w-6" />,
      href: "/admin/prices/discounts",
      color: "bg-purple-600/20",
      iconColor: "text-purple-400",
    },
    {
      title: "Currency Settings",
      description: "Configure supported currencies and exchange rates.",
      icon: <CreditCard className="h-6 w-6" />,
      href: "/admin/prices/currency",
      color: "bg-amber-600/20",
      iconColor: "text-amber-400",
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
            <Card key={module.title} className="bg-gray-900 border-gray-800 hover:bg-gray-900/80 shadow-md overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{module.title}</CardTitle>
                  <div className={`h-10 w-10 rounded-full ${module.color} flex items-center justify-center`}>
                    <div className={module.iconColor}>{module.icon}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-gray-400 min-h-[2.5rem]">
                  {module.description}
                </CardDescription>
              </CardContent>
              <CardFooter className="pt-0">
                <Button
                  variant="ghost"
                  className="w-full justify-between text-gray-300 hover:text-white hover:bg-gray-800/90"
                  onClick={() => navigate(module.href)}
                >
                  <span>Manage</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <Card className="mt-8 bg-gray-900 border-gray-800 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Price Strategy Overview</CardTitle>
              <div className="h-10 w-10 rounded-full bg-teal-600/20 flex items-center justify-center">
                <BarChart className="h-5 w-5 text-teal-400" />
              </div>
            </div>
            <CardDescription className="text-gray-400">
              Your pricing framework combines multiple components to create the final price offered to customers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border border-gray-700 rounded-md bg-gray-800/50">
                <h3 className="font-semibold text-base mb-2 text-gray-200">How Pricing Works</h3>
                <ol className="list-decimal ml-5 space-y-2 text-sm text-gray-300">
                  <li>
                    <span className="font-medium text-gray-200">Base Price:</span> The starting point for each route and travel class
                  </li>
                  <li>
                    <span className="font-medium text-gray-200">Additional Services:</span> Optional or required add-ons that can be selected
                  </li>
                  <li>
                    <span className="font-medium text-gray-200">Discounts & Promotions:</span> Reduce the final price based on specific criteria
                  </li>
                  <li>
                    <span className="font-medium text-gray-200">Currency Conversion:</span> Automatically convert prices to the customer's preferred currency
                  </li>
                </ol>
              </div>
              
              <div className="text-sm text-gray-400">
                <p className="mb-2">
                  Example Price Calculation:
                </p>
                <div className="font-mono bg-gray-800/50 border border-gray-700 p-3 rounded-md text-gray-300">
                  <div>Base Price (Economy LAX to JFK) = $250.00</div>
                  <div>+ Extra Baggage = $50.00</div>
                  <div>+ Priority Boarding = $20.00</div>
                  <div>= Subtotal: $320.00</div>
                  <div>- Discount (15% SUMMER2025) = -$48.00</div>
                  <div className="border-t border-gray-700 mt-1 pt-1 font-bold text-gray-200">Final Price = $272.00</div>
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