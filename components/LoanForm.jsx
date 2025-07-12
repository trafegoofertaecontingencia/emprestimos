"use client";
import { useState } from "react";
import { useLoanContext } from "../context/LoanContext";
import { v4 as uuidv4 } from "uuid";

export default function LoanForm() {
  const { dispatch } = useLoanContext();

  const [name, setName] = useState("");
  const [capital, setCapital] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [termDays, setTermDays] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (!name || !capital || !interestRate || !termDays) {
      alert("Preencha todos os campos!");
      return;
    }

    const newLoan = {
      id: uuidv4(),
      name,
      capital: parseFloat(capital),
      interestRate: parseFloat(interestRate) / 100,
      termDays: parseInt(termDays),
      startDate: new Date().toISOString(),
      transactions: []
    };

    dispatch({ type: "ADD_LOAN", payload: newLoan });

    setName("");
    setCapital("");
    setInterestRate("");
    setTermDays("");
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Nome</label>
        <input
          type="text"
          placeholder="Ex: Ailton"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Valor Emprestado (R$)</label>
        <input
          type="number"
          placeholder="Ex: 1000"
          value={capital}
          onChange={e => setCapital(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Taxa de Juros (%)</label>
        <input
          type="number"
          placeholder="Ex: 20"
          value={interestRate}
          onChange={e => setInterestRate(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Prazo (dias)</label>
        <input
          type="number"
          placeholder="Ex: 30"
          value={termDays}
          onChange={e => setTermDays(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="md:col-span-2">
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
        >
          Salvar Empréstimo
        </button>
      </div>
    </form>
  );
}
