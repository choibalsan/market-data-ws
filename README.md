# Binance Market Dashboard

A real‑time crypto market dashboard built with React, TypeScript, Zustand (with immer), Vite, and Mantine. It connects to Binance’s free WebSocket API to display live order book data and recent trades for a selected market.

## Key Features

- **Real-Time Data Streaming:**  
  Live updates from Binance for the order book (sell/buy orders with volume bars, spread, and midpoint) and recent trades (timestamp, price, quantity, trade direction).  
  I decided to subscribe to the `@depth20` stream and overwrite the local top 20 levels each time, rather than implementing the full snapshot + incremental bridging. This approach is much simpler and keeps the code lightweight. The trade‑off is that I won’t have a fully accurate local order book at all times if any updates are lost or arrive out of order. However, for a typical dashboard scenario—where users just want near‑real‑time top levels—this simplified method is sufficient. If I needed a fully consistent local book (e.g., for automated trading), I’d follow Binance’s official bridging procedure.

- **User-Friendly Market Selector:**  
  Fetches markets using Binance’s exchangeInfo API with caching for faster startup and a searchable dropdown.

- **Global Pause/Resume & Window Management:**  
  Ensures only one window maintains active WebSocket connections; users can pause/resume updates globally.

- **Optimized Rendering:**  
  WebSocket updates are throttled using `requestAnimationFrame` (with buffering if multiple trades arrive between frames), and components are memoized to maintain performance.

## Trade-offs & Decisions

- **Performance:**  
  I opted for buffering updates with `requestAnimationFrame` and memoizing row components instead of introducing lists virtualization. With around 300 trades, this simpler approach meets performance needs while keeping the code maintainable.

- **Data Integrity:**  
  I preserve Binance’s original string values for display while storing parsed numbers separately for calculations. This ensures accurate sorting, highlighting, and overall data integrity.

- **Styling Approach:**  
  Static styles are in `styles.css` for consistency and maintainability, dynamic styles (like conditional colors and highlights) are applied inline.

- **Mobile Adaptation:**  
  Media queries adjust the layout for mobile: the order book rows stack vertically and non-essential columns are hidden to improve readability.

- **Global State Management:**  
  Zustand (with immer) is chosen for its simplicity and predictable state updates.


## Setup & Run

1. **Install Dependencies:**

   ```
   npm install
   ```

2. **Run Development Server:**

   ```
   npm run dev
   ```

3. **Run Tests:**

   ```
   npm run test
   ```

4. **Build for Production:**
   ```
   npm run build
   ```
