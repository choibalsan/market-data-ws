import React, { useEffect } from 'react';
import { Select } from '@mantine/core';
import { useMarketStore, MarketInfo } from '../store/useMarketStore';

const MarketSelector: React.FC = () => {
  const markets = useMarketStore((state) => state.markets);
  const selectedMarket = useMarketStore((state) => state.selectedMarket);
  const setMarket = useMarketStore((state) => state.setMarket);
  const fetchMarkets = useMarketStore((state) => state.fetchMarkets);

  useEffect(() => {
    if (!markets || markets.length === 0) {
      fetchMarkets();
    }
  }, [markets, fetchMarkets]);

  // Transform MarketInfo objects into { value, label } for the Select
  const data = markets.map((m: MarketInfo) => ({
    value: m.symbol,
    label: `${m.baseAsset} / ${m.quoteAsset}`, // e.g. "BTC / USDT"
  }));

  return (
    <Select
      id="market-select"
      placeholder="Pick a market"
      searchable
      data={data}
      value={selectedMarket}
      onChange={(value) => {
        if (value) setMarket(value);
      }}
      style={{ minWidth: '180px' }}
    />
  );
};

export default MarketSelector;
