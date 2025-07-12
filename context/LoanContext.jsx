"use client";
import { createContext, useContext, useReducer, useEffect } from "react";

const LoanContext = createContext();

function loanReducer(state, action) {
  switch (action.type) {
    case "SET_LOANS":
      return action.payload;
    case "ADD_LOAN":
      return [...state, action.payload];
    case "DELETE_LOAN":
      return state.filter((loan) => loan.id !== action.payload);
    case "ADD_TRANSACTION":
      return state.map((loan) =>
        loan.id === action.payload.loanId
          ? {
              ...loan,
              capital:
                action.payload.transaction.type === "CAPITAL" ||
                action.payload.transaction.type === "BOTH"
                  ? loan.capital - action.payload.transaction.amount
                  : loan.capital,
              transactions: [...loan.transactions, action.payload.transaction],
            }
          : loan
      );
    default:
      return state;
  }
}

export function LoanProvider({ children }) {
  const [loans, dispatch] = useReducer(loanReducer, []);

  // Carregar do localStorage
  useEffect(() => {
    const stored = localStorage.getItem("loans");
    if (stored) {
      dispatch({ type: "SET_LOANS", payload: JSON.parse(stored) });
    }
  }, []);

  // Salvar no localStorage
  useEffect(() => {
    localStorage.setItem("loans", JSON.stringify(loans));
  }, [loans]);

  const addTransaction = (loanId, transaction) => {
    dispatch({
      type: "ADD_TRANSACTION",
      payload: { loanId, transaction },
    });
  };

  const deleteLoan = (loanId) => {
    dispatch({ type: "DELETE_LOAN", payload: loanId });
  };

  return (
    <LoanContext.Provider value={{ loans, dispatch, addTransaction, deleteLoan }}>
      {children}
    </LoanContext.Provider>
  );
}

export function useLoanContext() {
  return useContext(LoanContext);
}
