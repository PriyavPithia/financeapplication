import { DashboardHeader } from "@/components/dashboard-header";
import { TotalWealth } from "@/components/total-wealth";
import { OverviewChart } from "@/components/overview-chart";
import { AccountsList } from "@/components/accounts-list";
import { StocksList } from "@/components/stocks-list";
import { StockPortfolioHistogram } from "@/components/stock-portfolio-histogram";
import { FutureItemsTabs } from "@/components/future-items-tabs";
import { ExpensesCard } from "@/components/expenses-card";
import { CurrenciesTab } from "@/components/currencies-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  return (
    <div className="space-y-8">
      <DashboardHeader />
      
      <TotalWealth />
      <OverviewChart />

      <Tabs defaultValue="bank" className="w-full">
        <TabsList>
          <TabsTrigger value="bank">Bank Accounts</TabsTrigger>
          <TabsTrigger value="brokerage">Brokerage Accounts</TabsTrigger>
        </TabsList>
        <TabsContent value="bank" className="space-y-8">
          <AccountsList />
        </TabsContent>
        <TabsContent value="brokerage" className="space-y-8">
          <StocksList showBrokerageSummary={true} />
        </TabsContent>
      </Tabs>

      <Tabs defaultValue="stocks" className="w-full">
        <TabsList>
          <TabsTrigger value="stocks">Stocks</TabsTrigger>
          <TabsTrigger value="currencies">Currencies</TabsTrigger>
        </TabsList>
        <TabsContent value="stocks" className="space-y-8">
          <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
            <StocksList showBrokerageSummary={false} />
            <StockPortfolioHistogram />
          </div>
        </TabsContent>
        <TabsContent value="currencies">
          <CurrenciesTab />
        </TabsContent>
      </Tabs>

      <ExpensesCard />
      <FutureItemsTabs />
    </div>
  );
}