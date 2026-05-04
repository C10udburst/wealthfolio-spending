import { useState, useEffect } from 'react';
import type { AddonContext } from '@wealthfolio/addon-sdk';

export function useAccounts(ctx: AddonContext) {
  const [accounts, setAccounts] = useState<{ id: string, name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAccounts() {
      try {
        const accs = await ctx.api.accounts.getAll();
        setAccounts(accs.map((a: any) => ({ id: a.id, name: a.name })));
      } catch (err) {
        ctx.api.logger.error('Failed to fetch accounts:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAccounts();
  }, [ctx]);

  return { accounts, loading };
}
