"use client";
import { createContext, useContext, useReducer, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

const LoanContext = createContext();

const initialState = {
  loans: [],
  initialized: false
};

function loanReducer(state, action) {
  switch (action.type) {
    case "SET_LOANS":
      return { ...state, loans: action.payload, initialized: true };

    case "ADD_LOAN":
      return { ...state, loans: [...state.loans, action.payload] };

    case "DELETE_LOAN":
      return { ...state, loans: state.loans.filter(loan => loan.id !== action.payload) };

    case "ADD_TRANSACTION":
      return {
        ...state,
        loans: state.loans.map(loan => {
          if (loan.id === action.payload.loanId) {
            const tx = action.payload.transaction;
            return {
              ...loan,
              capital:
                tx.type === "CAPITAL" || tx.type === "BOTH"
                  ? Math.max(0, loan.capital - tx.amount)
                  : loan.capital,
              transactions: [...loan.transactions, tx]
            };
          }
          return loan;
        })
      };

    default:
      return state;
  }
}

export function LoanProvider({ children }) {
  const [state, dispatch] = useReducer(loanReducer, initialState);

  // Carregar do localStorage ao iniciar
  useEffect(() => {
    const stored = localStorage.getItem("loans");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          dispatch({ type: "SET_LOANS", payload: parsed });
        }
      } catch (err) {
        console.error("Erro ao ler localStorage", err);
      }
    } else {
      dispatch({ type: "SET_LOANS", payload: [] });
    }
  }, []);

  // Atualiza o localStorage quando loans mudarem
  useEffect(() => {
    if (state.initialized) {
      localStorage.setItem("loans", JSON.stringify(state.loans));
    }
  }, [state.loans, state.initialized]);

  return (
    <LoanContext.Provider value={{ state, dispatch }}>
      {children}
    </LoanContext.Provider>
  );
}

export function useLoanContext() {
  const context = useContext(LoanContext);
  if (!context) {
    throw new Error("useLoanContext deve ser usado dentro de <LoanProvider>");
  }
  return context;
}
