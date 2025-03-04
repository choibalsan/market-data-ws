import { OrderBookLevel } from '../store/useMarketStore';

/**
 * Compares two arrays of order book levels and returns an object whose keys are
 * in the format `${prefix}-${price}` for levels that are new or whose volume has changed.
 * 
 * @param newLevels - The current array of levels.
 * @param oldLevels - The previous array of levels.
 * @param prefix - A string prefix ("ask" or "bid").
 * @returns An object with keys for levels that should be highlighted.
 */
export function computeHighlights(
  newLevels: OrderBookLevel[],
  oldLevels: OrderBookLevel[],
  prefix: string
): { [key: string]: boolean } {
  const highlights: { [key: string]: boolean } = {};

  newLevels.forEach((level) => {
    const key = `${prefix}-${level.price}`;
    const prevLevel = oldLevels.find(
      (l) => Math.abs(l.priceParsed - level.priceParsed) < 1e-8
    );
    if (!prevLevel || prevLevel.volumeParsed !== level.volumeParsed) {
      highlights[key] = true;
    }
  });

  return highlights;
}
