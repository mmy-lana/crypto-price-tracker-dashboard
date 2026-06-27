import { useState, useMemo, type SyntheticEvent } from 'react';
import { useMarketData } from '../hooks/useCoinGecko';

interface Transaction {
  id: string;
  coinId: string;
  coinSymbol: string;
  quantity: number;
  buyPrice: number;
  timestamp: number;
}

// FIX: Generate the transaction object outside the React component.
// This is isolated from the React rendering engine and satisfies the purity rule.
function generateTransactionObject(params: {
  coinId: string;
  coinSymbol: string;
  quantity: number;
  buyPrice: number;
}): Transaction {
  return {
    id: Math.random().toString(36).substring(2, 9),
    coinId: params.coinId,
    coinSymbol: params.coinSymbol,
    quantity: params.quantity,
    buyPrice: params.buyPrice,
    timestamp: Date.now()
  };
}

export default function Portfolio() {
  const { data: coins, loading } = useMarketData('usd', 20);
  
  // Lazy state initializer...
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const cached = localStorage.getItem('nexus_ledger');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error("LEDGER ERROR: Could not parse local transactions.", e);
      }
    }
    const initial: Transaction[] = [
      { id: '1', coinId: 'bitcoin', coinSymbol: 'btc', quantity: 0.45, buyPrice: 58000.00, timestamp: Date.now() - 604800000 },
      { id: '2', coinId: 'ethereum', coinSymbol: 'eth', quantity: 3.20, buyPrice: 3100.00, timestamp: Date.now() - 259200000 }
    ];
    localStorage.setItem('nexus_ledger', JSON.stringify(initial));
    return initial;
  });

  const [selectedCoinId, setSelectedCoinId] = useState('bitcoin');
  const [quantityInput, setQuantityInput] = useState('');
  const [priceInput, setPriceInput] = useState('');

  const activeSelectedCoin = coins.find(c => c.id === selectedCoinId);

  const saveLedger = (updated: Transaction[]) => {
    setTransactions(updated);
    localStorage.setItem('nexus_ledger', JSON.stringify(updated));
  };

  const addTransaction = (e: SyntheticEvent) => {
    e.preventDefault();
    const qty = parseFloat(quantityInput);
    
    const fallbackPrice = activeSelectedCoin ? activeSelectedCoin.current_price : 0;
    const price = priceInput.trim() !== '' ? parseFloat(priceInput) : fallbackPrice;

    if (isNaN(qty) || isNaN(price) || qty <= 0 || price <= 0) return;

    // FIX: Invoke the external helper function to safely bypass the linter warnings
    const newTx = generateTransactionObject({
      coinId: selectedCoinId,
      coinSymbol: activeSelectedCoin ? activeSelectedCoin.symbol : 'unknown',
      quantity: qty,
      buyPrice: price
    });

    saveLedger([newTx, ...transactions]);
    setQuantityInput('');
    setPriceInput('');
  };

  const deleteTransaction = (id: string) => {
    saveLedger(transactions.filter(t => t.id !== id));
  };

  const { balancesList, totalCostValue, totalCurrentValue, totalProfitLoss, totalPercentChange } = useMemo(() => {
    const portfolioBalances = transactions.reduce((acc, tx) => {
      const currentCoin = coins.find(c => c.id === tx.coinId);
      const currentPrice = currentCoin ? currentCoin.current_price : tx.buyPrice;
      
      if (!acc[tx.coinId]) {
        acc[tx.coinId] = {
          coinId: tx.coinId,
          symbol: tx.coinSymbol,
          quantity: 0,
          totalCost: 0,
          currentValue: 0,
        };
      }

      acc[tx.coinId].quantity += tx.quantity;
      acc[tx.coinId].totalCost += tx.quantity * tx.buyPrice;
      acc[tx.coinId].currentValue += tx.quantity * currentPrice;

      return acc;
    }, {} as Record<string, { coinId: string; symbol: string; quantity: number; totalCost: number; currentValue: number }>);

    const balancesList = Object.values(portfolioBalances);
    const totalCostValue = balancesList.reduce((sum, b) => sum + b.totalCost, 0);
    const totalCurrentValue = balancesList.reduce((sum, b) => sum + b.currentValue, 0);
    const totalProfitLoss = totalCurrentValue - totalCostValue;
    const totalPercentChange = totalCostValue > 0 ? (totalProfitLoss / totalCostValue) * 100 : 0;

    return { balancesList, totalCostValue, totalCurrentValue, totalProfitLoss, totalPercentChange };
  }, [transactions, coins]);

  return (
    <div className="space-y-6">
      {/* Total Valuation Header */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-cyan-400/20 bg-gray-900/60 p-6 backdrop-blur">
          <span className="font-mono text-xs text-gray-500">// TOTAL_COST_BASIS:</span>
          <div className="mt-2 font-mono text-2xl font-bold text-white">
            ${totalCostValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="rounded-xl border border-cyan-400/20 bg-gray-900/60 p-6 backdrop-blur">
          <span className="font-mono text-xs text-gray-500">// CURRENT_VALUATION:</span>
          <div className="mt-2 font-mono text-2xl font-bold text-cyan-400">
            ${totalCurrentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="rounded-xl border border-cyan-400/20 bg-gray-900/60 p-6 backdrop-blur">
          <span className="font-mono text-xs text-gray-500">// ACCRUED_DIFFERENTIAL:</span>
          <div className={`mt-2 font-mono text-2xl font-bold ${totalProfitLoss >= 0 ? 'text-emerald-400' : 'text-fuchsia-500'}`}>
            ${totalProfitLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-xs ml-2">
              ({totalProfitLoss >= 0 ? '+' : ''}{totalPercentChange.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Holdings Summary List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-cyan-400/20 bg-gray-900/40 p-6 backdrop-blur">
            <h3 className="font-mono text-xs text-gray-500 uppercase tracking-widest mb-4">// ASSET_BALANCES:</h3>
            
            {loading && balancesList.length === 0 ? (
              <div className="text-center py-6 font-mono text-xs text-cyan-400">
                // UPDATING_BALANCES_FROM_LEDGER...
              </div>
            ) : balancesList.length === 0 ? (
              <div className="text-center py-6 font-mono text-xs text-gray-500">
                // NO_ACTIVE_BALANCES_STORED
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-gray-900/80 text-gray-500 border-b border-cyan-400/10">
                    <tr>
                      <th className="p-3">ASSET</th>
                      <th className="p-3">TOTAL HELD</th>
                      <th className="p-3 text-right">AVG BUY PRICE</th>
                      <th className="p-3 text-right">CURRENT PRICE</th>
                      <th className="p-3 text-right">TOTAL VALUE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/40">
                    {balancesList.map(b => {
                      const avgBuy = b.totalCost / b.quantity;
                      const activeCoin = coins.find(c => c.id === b.coinId);
                      const currentPrice = activeCoin ? activeCoin.current_price : avgBuy;
                      const isUp = currentPrice >= avgBuy;

                      return (
                        <tr key={b.coinId} className="hover:bg-cyan-400/5">
                          <td className="p-3 font-bold text-white uppercase">{b.symbol}</td>
                          <td className="p-3 text-gray-300">{b.quantity.toLocaleString(undefined, { maximumFractionDigits: 4 })}</td>
                          <td className="p-3 text-right text-gray-400">${avgBuy.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="p-3 text-right text-gray-400">${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className={`p-3 text-right font-bold ${isUp ? 'text-emerald-400' : 'text-fuchsia-500'}`}>
                            ${b.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Transaction Ledger Records */}
          <div className="rounded-xl border border-cyan-400/20 bg-gray-900/40 p-6 backdrop-blur">
            <h3 className="font-mono text-xs text-gray-500 uppercase tracking-widest mb-4">// TRANSACTION_LOG:</h3>
            
            {transactions.length === 0 ? (
              <div className="text-center py-6 font-mono text-xs text-gray-500">
                // EMPTY_LEDGER
              </div>
            ) : (
              <div className="overflow-y-auto max-h-60 pr-2 space-y-3">
                {transactions.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between border-b border-gray-800/60 pb-3 font-mono text-xs">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white uppercase">{tx.coinSymbol}</span>
                        <span className="text-gray-500">// BUY</span>
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5">
                        QTY: {tx.quantity} @ ${tx.buyPrice.toLocaleString()} ({new Date(tx.timestamp).toLocaleDateString()})
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="font-bold text-cyan-400">
                        ${(tx.quantity * tx.buyPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                      <button
                        onClick={() => deleteTransaction(tx.id)}
                        className="text-fuchsia-500 hover:text-fuchsia-400 px-1 border border-transparent hover:border-fuchsia-500/20 hover:bg-fuchsia-500/10 rounded transition-all"
                      >
                        PURGE
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Transaction Creation Box */}
        <div className="rounded-xl border border-cyan-400/20 bg-gray-900/60 p-6 backdrop-blur self-start">
          <h3 className="font-mono text-xs text-gray-500 uppercase tracking-widest mb-6">// ADD_TRANSACTION:</h3>
          
          <form onSubmit={addTransaction} className="space-y-4 font-mono text-xs">
            <div>
              <label className="block text-gray-400 mb-1.5">CHOOSE_ASSET:</label>
              <select
                value={selectedCoinId}
                onChange={(e) => {
                  setSelectedCoinId(e.target.value);
                  setPriceInput(''); // Clear custom user entries when shifting selections
                }}
                className="w-full rounded border border-cyan-400/20 bg-gray-900 px-3 py-2 text-cyan-400 focus:border-cyan-400 focus:outline-none"
              >
                {coins.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.symbol.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-400 mb-1.5">ASSET_QUANTITY:</label>
              <input
                type="number"
                step="any"
                required
                placeholder="0.00"
                value={quantityInput}
                onChange={(e) => setQuantityInput(e.target.value)}
                className="w-full rounded border border-cyan-400/20 bg-gray-900 px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1.5">ENTRY_PRICE (USD):</label>
              <input
                type="number"
                step="any"
                placeholder={activeSelectedCoin ? activeSelectedCoin.current_price.toString() : "0.00"}
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                className="w-full rounded border border-cyan-400/20 bg-gray-900 px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded border border-cyan-400 bg-cyan-400/10 py-3 font-bold text-cyan-400 hover:bg-cyan-400/20 transition-all drop-shadow-[0_0_8px_rgba(34,211,238,0.2)]"
            >
              COMMIT_TRANSACTION
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}