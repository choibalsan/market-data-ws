import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useMarketStore } from '../store/useMarketStore';
import TradesGrid from '../components/TradesGrid';

describe('TradesGrid', () => {
  it('renders trades', () => {
    useMarketStore.setState({
      trades: [
        {
          id: 't1',
          price: '100.0',
          priceParsed: 100.0,
          quantity: '0.5',
          quantityParsed: 0.5,
          timestamp: 1234567890000,
          side: 'buy',
        },
        {
          id: 't2',
          price: '101.0',
          priceParsed: 101.0,
          quantity: '2.0',
          quantityParsed: 2.0,
          timestamp: 1234567891000,
          side: 'sell',
        },
      ],
    });

    render(<TradesGrid />);

    // Expect 2 rows
    expect(screen.getByText('100.0')).toBeInTheDocument();
    expect(screen.getByText('101.0')).toBeInTheDocument();
  });

  it('displays placeholder if no trades', () => {
    useMarketStore.setState({ trades: [] });
    render(<TradesGrid />);
    expect(screen.getByText(/waiting for trades/i)).toBeInTheDocument();
  });
});
