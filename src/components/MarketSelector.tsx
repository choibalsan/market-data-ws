import React, { useEffect } from 'react';
import { Select } from '@mantine/core';
import { useMarketStore } from '../store/useMarketStore';

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

  const data = markets.map((market) => ({ value: market, label: market }));

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
