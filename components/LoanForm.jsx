"use client";
import { useLoanContext } from "../context/LoanContext";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function LoanForm() {
  const { dispatch } = useLoanContext();

  const [name, setName] = useState("");
  const [capital, setCapital] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [termDays, setTermDays] = useState("");
  const [startDate, setStartDate] = useState("");
  const [lastPaymentDate, setLastPaymentDate] = useState("");

  // 🛠 Corrige a data para fuso horário local (evita aparecer como "um dia antes")
  function fixDateToLocal(inputDate) {
    const [year, month, day] = inputDate.split("-");
    return new Date(year, month - 1, day, 12).toISOString(); // meio-dia no horário local
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!name || !capital || !interestRate || !termDays || !startDate) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    const newLoan = {
      id: uuidv4(),
      name,
      capital: parseFloat(capital),
      interestRate: parseFloat(interestRate) / 100,
      termDays: parseInt(termDays),
      startDate: fixDateToLocal(startDate),
      transactions: [],
    };

    if (lastPaymentDate) {
      newLoan.transactions.push({
        id: uuidv4(),
        amount: 0,
        type: "INTEREST",
        paidAt: fixDateToLocal(lastPaymentDate),
      });
    }

    dispatch({ type: "ADD_LOAN", payload: newLoan });

    // limpar campos
    setName("");
    setCapital("");
    setInterestRate("");
    setTermDays("");
    setStartDate("");
    setLastPaymentDate("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl shadow-md mb-6 space-y-4"
    >
      <h2 className="text-xl font-semibold text-gray-800 mb-4">📋 Novo Empréstimo</h2>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nome</label>
          <input
            type="text"
            className="w-full mt-1 px-3 py-2 border rounded shadow-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Capital (R$)</label>
          <input
            type="number"
            className="w-full mt-1 px-3 py-2 border rounded shadow-sm"
            value={capital}
            onChange={(e) => setCapital(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Juros (%)</label>
          <input
            type="number"
            className="w-full mt-1 px-3 py-2 border rounded shadow-sm"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Prazo (dias)</label>
          <input
            type="number"
            className="w-full mt-1 px-3 py-2 border rounded shadow-sm"
            value={termDays}
            onChange={(e) => setTermDays(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Data do empréstimo</label>
          <input
            type="date"
            className="w-full mt-1 px-3 py-2 border rounded shadow-sm"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Data do último pagamento (opcional)
          </label>
          <input
            type="date"
            className="w-full mt-1 px-3 py-2 border rounded shadow-sm"
            value={lastPaymentDate}
            onChange={(e) => setLastPaymentDate(e.target.value)}
          />
        </div>
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 mt-4"
      >
        Cadastrar empréstimo
      </button>
    </form>
  );
}
