import React, { useEffect, useState } from 'react';
import { useMarketStore } from '../store/useMarketStore';

const MarketSelector = () => {
  const [markets, setMarkets] = useState<string[]>([]);
  const selectedMarket = useMarketStore((state) => state.selectedMarket);
  const setMarket = useMarketStore((state) => state.setMarket);

  useEffect(() => {
    // Fetch available markets from Binance
    fetch('https://api.binance.com/api/v3/exchangeInfo')
        .then(res => res.json())
        .then(data => {
          const symbols = data.symbols
              .filter((s: any) => s.status === 'TRADING')
              .map((s: any) => s.symbol);
          setMarkets(symbols);
        })
        .catch(err => console.error("Failed to fetch markets:", err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const market = e.target.value;
    setMarket(market);
  };

  return (
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="market-select">Select Market: </label>
        <select id="market-select" value={selectedMarket} onChange={handleChange}>
          {markets.map((market) => (
              <option key={market} value={market}>
                {market}
              </option>
          ))}
        </select>
      </div>
  );
};

export default MarketSelector;
