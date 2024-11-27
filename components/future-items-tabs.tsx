"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FutureStocks } from "@/components/future-stocks";
import { FutureGains } from "@/components/future-gains";
import { FutureExpenses } from "@/components/future-expenses";

export function FutureItemsTabs() {
  return (
    <Tabs defaultValue="stocks" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="stocks">Future Stock Grants</TabsTrigger>
        <TabsTrigger value="gains">Future Gains</TabsTrigger>
        <TabsTrigger value="expenses">Future Expenses</TabsTrigger>
      </TabsList>
      <TabsContent value="stocks" className="mt-6">
        <FutureStocks />
      </TabsContent>
      <TabsContent value="gains" className="mt-6">
        <FutureGains />
      </TabsContent>
      <TabsContent value="expenses" className="mt-6">
        <FutureExpenses />
      </TabsContent>
    </Tabs>
  );
}