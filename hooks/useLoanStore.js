import { useState, useEffect } from "react";

export function useLoanStore() {
  const [loans, setLoans] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false); // controle da leitura

  // 1. Lê do localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("loans");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setLoans(parsed);
          }
        } catch (err) {
          console.error("Erro ao carregar dados do localStorage", err);
        }
      }
      setIsInitialized(true); // só depois disso pode salvar
    }
  }, []);

  // 2. Escreve no localStorage SOMENTE após leitura
  useEffect(() => {
    if (typeof window !== "undefined" && isInitialized) {
      localStorage.setItem("loans", JSON.stringify(loans));
    }
  }, [loans, isInitialized]);

  function addLoan(loan) {
    setLoans(prev => [...prev, loan]);
  }

  function updateLoan(id, updatedData) {
    setLoans(prev =>
      prev.map(loan => (loan.id === id ? { ...loan, ...updatedData } : loan))
    );
  }

  function deleteLoan(id) {
    setLoans(prev => prev.filter(loan => loan.id !== id));
  }

  function addTransaction(loanId, transaction) {
    setLoans(prev =>
      prev.map(loan =>
        loan.id === loanId
          ? {
              ...loan,
              transactions: [...(loan.transactions || []), transaction],
              capital:
                transaction.type === "CAPITAL" || transaction.type === "BOTH"
                  ? Math.max(0, loan.capital - transaction.amount)
                  : loan.capital
            }
          : loan
      )
    );
  }

  return {
    loans,
    addLoan,
    updateLoan,
    deleteLoan,
    addTransaction
  };
}
