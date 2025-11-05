"use client";
import { ReportsHeaderCardSkeleton } from "@/components/fallbacks/skeletons";
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ReportsMetricCard } from "@/lib/definations";
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function HeaderSectionCards() {

  // Fetch metrics data,
  const { data, error, isLoading } = useSWR<ReportsMetricCard[]>('/api/reports/header-cards', fetcher)

  if (isLoading) return <ReportsHeaderCardSkeleton />
  if (error) return <div>Failed to load</div>

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 *:data-[slot=card]:shadow-xs">
      {data?.map((metric, index) => (
        <Card className="@container/card" key={index}>
          <CardHeader>
            <CardDescription>{metric.title}</CardDescription>
            <CardTitle className="text-xl font-semibold tabular-nums @[250px]/card:text-2xl">
              {metric.value}
            </CardTitle>

            {metric.change && (
              <CardAction>
                <Badge variant="outline" className="sm:text-xs md:text-[0.6rem] lg:text-sm">{metric.change}</Badge>
              </CardAction>
            )}

            {metric.currency && (
              <CardDescription className="font-semibold">PKR</CardDescription>
            )}
          </CardHeader>

          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            {metric.trend && (
              <div className="line-clamp-1 flex gap-2 font-medium">{metric.trend}</div>
            )}
            <div className="text-muted-foreground">{metric.description}</div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
