// components/table/cells/TransactionTitleCell.tsx
'use client';

import React from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import TransactionDetailsHoverCard from './transaction-details-hover-card';
import { useIsMobile } from '@/hooks/use-mobile';
import { TransactionsTablesInterface } from '@/lib/definations';

interface Props {
  row: TransactionsTablesInterface;
}

const TransactionTitleCell: React.FC<Props> = ({ row }) => {
  const isMobile = useIsMobile();

  const TriggerElement = (
    <div className="capitalize cursor-pointer underline">
      {row.title}
    </div>
  );

  return isMobile ? (
    <Popover>
      <PopoverTrigger asChild>{TriggerElement}</PopoverTrigger>
      <PopoverContent className="w-96 p-4">
        <TransactionDetailsHoverCard row={row} />
      </PopoverContent>
    </Popover>
  ) : (
    <HoverCard>
      <HoverCardTrigger asChild>{TriggerElement}</HoverCardTrigger>
      <HoverCardContent className="w-96 p-4">
        <TransactionDetailsHoverCard row={row} />
      </HoverCardContent>
    </HoverCard>
  );
};

export default TransactionTitleCell;
