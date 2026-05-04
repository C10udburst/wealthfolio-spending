import React from 'react';
import type { AddonContext } from '@wealthfolio/addon-sdk';
import { Icons } from '@wealthfolio/ui';
import { Dashboard } from './pages';

export default function enable(ctx: AddonContext) {
  // Add a sidebar item
  const sidebarItem = ctx.sidebar.addItem({
    id: 'spending-tracker',
    label: 'Spending',
    icon: <Icons.Wallet className="h-5 w-5" />,
    route: '/addon/spending',
    order: 10,
  });

  // Add a route
  ctx.router.add({
    path: '/addon/spending',
    component: React.lazy(() => Promise.resolve({ default: () => <Dashboard ctx={ctx} /> })),
  });

  // Cleanup on disable
  ctx.onDisable(() => {
    try {
      sidebarItem.remove();
    } catch (err) {
      ctx.api.logger.error('Failed to remove sidebar item:', err);
    }
  });
}
