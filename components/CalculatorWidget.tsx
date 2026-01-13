'use client';

import { useState, useEffect } from 'react';
import { useWindowStore } from '@/store/useWindowStore';
import { Delete, History } from 'lucide-react';

interface CalculatorWidgetProps {
  windowId: string;
}

interface HistoryItem {
  expression: string;
  result: string;
}

export default function CalculatorWidget({ windowId }: CalculatorWidgetProps) {
  const { getWindows, updateWindowContent } = useWindowStore();
  const windows = getWindows();
  const window = windows.find((w) => w.id === windowId);
  
  const content = (window?.content as { history?: HistoryItem[] }) || {};
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>(content.history || []);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    updateWindowContent(windowId, { history });
  }, [history, windowId, updateWindowContent]);

  const handleNumber = (num: string) => {
    if (display === '0' || display === 'Error') {
      setDisplay(num);
      setExpression(num);
    } else {
      setDisplay(display + num);
      setExpression(expression + num);
    }
  };

  const handleOperator = (op: string) => {
    if (display === 'Error') return;
    setDisplay(display + ' ' + op + ' ');
    setExpression(expression + op);
  };

  const handleDecimal = () => {
    const parts = display.split(/[\+\-\*\/]/);
    const lastPart = parts[parts.length - 1];
    if (!lastPart.includes('.')) {
      setDisplay(display + '.');
      setExpression(expression + '.');
    }
  };

  const handleEquals = () => {
    try {
      // eslint-disable-next-line no-eval
      const result = eval(expression);
      const resultStr = result.toString();
      
      const historyItem: HistoryItem = {
        expression: display,
        result: resultStr,
      };
      
      setHistory([historyItem, ...history.slice(0, 19)]); // Mantener últimos 20
      setDisplay(resultStr);
      setExpression(resultStr);
    } catch (error) {
      setDisplay('Error');
      setExpression('');
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setExpression('');
  };

  const handleBackspace = () => {
    if (display.length > 1 && display !== 'Error') {
      const newDisplay = display.slice(0, -1);
      const newExpression = expression.slice(0, -1);
      setDisplay(newDisplay);
      setExpression(newExpression);
    } else {
      handleClear();
    }
  };

  const handlePercentage = () => {
    try {
      // eslint-disable-next-line no-eval
      const result = eval(expression) / 100;
      setDisplay(result.toString());
      setExpression(result.toString());
    } catch (error) {
      setDisplay('Error');
    }
  };

  const buttons = [
    ['C', '%', '⌫', '/'],
    ['7', '8', '9', '*'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '='],
  ];

  const getButtonClass = (btn: string) => {
    if (btn === '=') {
      return 'col-span-1 bg-blue-600 hover:bg-blue-700 text-white font-bold';
    }
    if (['/', '*', '-', '+'].includes(btn)) {
      return 'bg-orange-600 hover:bg-orange-700 text-white font-bold';
    }
    if (['C', '%', '⌫'].includes(btn)) {
      return 'bg-gray-600 hover:bg-gray-500 text-white';
    }
    return 'bg-gray-700 hover:bg-gray-600 text-white';
  };

  const handleButtonClick = (btn: string) => {
    if (btn === 'C') handleClear();
    else if (btn === '⌫') handleBackspace();
    else if (btn === '=') handleEquals();
    else if (btn === '%') handlePercentage();
    else if (btn === '.') handleDecimal();
    else if (['/', '*', '-', '+'].includes(btn)) handleOperator(btn);
    else handleNumber(btn);
  };

  return (
    <div className="h-full flex flex-col bg-gray-800/50 text-white">
      {/* Display */}
      <div className="p-4 bg-gray-900/50 border-b border-gray-700">
        <div className="text-right text-3xl font-mono break-all">{display}</div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setShowHistory(false)}
          className={`flex-1 px-4 py-2 text-sm ${!showHistory ? 'bg-gray-700 border-b-2 border-blue-500' : 'hover:bg-gray-700/50'}`}
        >
          Calculadora
        </button>
        <button
          onClick={() => setShowHistory(true)}
          className={`flex-1 px-4 py-2 text-sm flex items-center justify-center gap-2 ${showHistory ? 'bg-gray-700 border-b-2 border-blue-500' : 'hover:bg-gray-700/50'}`}
        >
          <History className="w-4 h-4" />
          Historial
        </button>
      </div>

      {/* Content */}
      {showHistory ? (
        <div className="flex-1 overflow-y-auto p-3">
          {history.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p className="text-sm">No hay historial</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-gray-700/30 border border-gray-600/30 rounded"
                >
                  <div className="text-sm text-gray-400">{item.expression}</div>
                  <div className="text-lg font-bold text-blue-400">= {item.result}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 p-3">
          {/* Calculator Buttons */}
          <div className="grid grid-cols-4 gap-2 h-full">
            {buttons.map((row, rowIdx) => (
              row.map((btn, btnIdx) => (
                <button
                  key={`${rowIdx}-${btnIdx}`}
                  onClick={() => handleButtonClick(btn)}
                  className={`${getButtonClass(btn)} rounded-lg text-xl font-semibold transition-colors ${
                    btn === '0' ? 'col-span-2' : ''
                  }`}
                >
                  {btn}
                </button>
              ))
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
