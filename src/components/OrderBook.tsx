import React from 'react';
import { useMarketStore } from '../store/useMarketStore';

const OrderBook = () => {
  const { orderBook } = useMarketStore();

  return (
      <div style={{ marginBottom: '1rem' }}>
        <h2>Order Book</h2>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <div>
            <h3>Bids</h3>
            <table>
              <thead>
              <tr>
                <th>Price</th>
                <th>Volume</th>
              </tr>
              </thead>
              <tbody>
              {orderBook.bids.map((level, idx) => (
                  <tr key={`bid-${idx}`}>
                    <td>{level.price}</td>
                    <td>{level.volume}</td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>
          <div>
            <h3>Asks</h3>
            <table>
              <thead>
              <tr>
                <th>Price</th>
                <th>Volume</th>
              </tr>
              </thead>
              <tbody>
              {orderBook.asks.map((level, idx) => (
                  <tr key={`ask-${idx}`}>
                    <td>{level.price}</td>
                    <td>{level.volume}</td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
};

export default OrderBook;
