import { useState, useEffect } from 'react';
import type { AddonContext } from '@wealthfolio/addon-sdk';

export function useSettings(ctx: AddonContext) {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const s = await ctx.api.settings.get();
        setSettings(s);
      } catch (err) {
        ctx.api.logger.error('Failed to fetch settings:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, [ctx]);

  return { settings, loading, currency: settings?.baseCurrency || 'USD' };
}
