"use client";
import { useLoanContext } from "../context/LoanContext";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function LoanList() {
  const { loans, addTransaction, deleteLoan } = useLoanContext();

  const [filtroNome, setFiltroNome] = useState("");
  const [filtroDataVencimento, setFiltroDataVencimento] = useState("");

  function calcularUltimoPagamento(loan) {
    if (loan.transactions.length === 0) return loan.startDate;
    return loan.transactions.reduce((a, b) =>
      new Date(a.paidAt) > new Date(b.paidAt) ? a : b
    ).paidAt;
  }

  function calcularJuros(loan) {
    return loan.capital * loan.interestRate;
  }

  function pagarJuros(id) {
    const loan = loans.find((l) => l.id === id);
    const juros = calcularJuros(loan);

    const tx = {
      id: uuidv4(),
      amount: juros,
      type: "INTEREST",
      paidAt: new Date().toISOString(),
    };

    addTransaction(id, tx);
    alert("Juros pagos.");
  }

  function abaterCapital(id) {
    const valor = parseFloat(prompt("Digite quanto deseja abater do capital:"));
    if (!valor || valor <= 0) return;

    const tx = {
      id: uuidv4(),
      amount: valor,
      type: "BOTH",
      paidAt: new Date().toISOString(),
    };

    addTransaction(id, tx);
    alert("Juros e capital abatidos.");
  }

  function quitarTudo(id) {
    const loan = loans.find((l) => l.id === id);
    const juros = calcularJuros(loan);

    const txJuros = {
      id: uuidv4(),
      amount: juros,
      type: "INTEREST",
      paidAt: new Date().toISOString(),
    };

    const txCapital = {
      id: uuidv4(),
      amount: loan.capital,
      type: "CAPITAL",
      paidAt: new Date().toISOString(),
    };

    addTransaction(id, txJuros);
    addTransaction(id, txCapital);

    alert("Empréstimo quitado.");
    deleteLoan(id);
  }

  const hoje = new Date();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Filtrar por nome"
          value={filtroNome}
          onChange={(e) => setFiltroNome(e.target.value)}
          className="border px-3 py-2 rounded w-full sm:w-1/2"
        />
        <input
          type="date"
          placeholder="Filtrar por vencimento"
          value={filtroDataVencimento}
          onChange={(e) => setFiltroDataVencimento(e.target.value)}
          className="border px-3 py-2 rounded w-full sm:w-1/2"
        />
      </div>

      {loans.length === 0 && (
        <p className="text-gray-500">Nenhum empréstimo cadastrado ainda.</p>
      )}

      {loans
        .filter((loan) => {
          const nomeMatch = loan.name
            .toLowerCase()
            .includes(filtroNome.toLowerCase());

          if (!filtroDataVencimento) return nomeMatch;

          const ultimoPagamento = calcularUltimoPagamento(loan);
          const dataVencimento = new Date(
            new Date(ultimoPagamento).getTime() + loan.termDays * 86400000
          );

          const vencimentoFormatado = dataVencimento
            .toISOString()
            .slice(0, 10);

          return nomeMatch && vencimentoFormatado === filtroDataVencimento;
        })
        .map((loan) => {
          const juros = calcularJuros(loan);
          const ultimoPagamento = calcularUltimoPagamento(loan);
          const dataVencimento = new Date(
            new Date(ultimoPagamento).getTime() + loan.termDays * 86400000
          );

          // Corrigido para considerar vencido se data de vencimento for MENOR OU IGUAL a hoje
          const vencido = new Date().setHours(0, 0, 0, 0) >=
            dataVencimento.setHours(0, 0, 0, 0);

          const diasParaVencer = Math.ceil(
            (dataVencimento - new Date()) / 86400000
          );

          return (
            <div
              key={loan.id}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{loan.name}</h3>
                <span className="text-sm text-gray-500">
                  ID: {loan.id.slice(0, 6)}...
                </span>
              </div>

              <ul className="text-sm space-y-1 mb-4">
                <li>
                  📆 Emprestou no dia:{" "}
                  <strong>
                    {new Date(loan.startDate).toLocaleDateString("pt-BR")}
                  </strong>
                </li>
                <li>
                  📦 Capital atual: <strong>R$ {loan.capital.toFixed(2)}</strong>
                </li>
                <li>
                  💸 Juros: <strong>R$ {juros.toFixed(2)}</strong>
                </li>
                <li>
                  ⏱️ Vencimento:{" "}
                  <strong>
                    {vencido
                      ? "Vencido"
                      : `em ${diasParaVencer} dia${diasParaVencer !== 1 ? "s" : ""}`}
                  </strong>
                </li>
                <li>
                  📅 Último pagamento:{" "}
                  <strong>
                    {new Date(ultimoPagamento).toLocaleDateString("pt-BR")}
                  </strong>
                </li>
              </ul>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => pagarJuros(loan.id)}
                  className={`${
                    vencido
                      ? "bg-yellow-500 hover:bg-yellow-600"
                      : "bg-gray-500 hover:bg-gray-600"
                  } text-white py-2 px-4 rounded`}
                >
                  {vencido
                    ? "Pagar juros (vencido)"
                    : "Pagar juros antecipado"}
                </button>

                <button
                  onClick={() => abaterCapital(loan.id)}
                  className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                  Pagar juros + abater capital
                </button>

                <button
                  onClick={() => {
                    if (
                      confirm("Tem certeza que deseja quitar e excluir este empréstimo?")
                    ) {
                      quitarTudo(loan.id);
                    }
                  }}
                  className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                >
                  Quitar tudo
                </button>
              </div>
            </div>
          );
        })}
    </div>
  );
}
