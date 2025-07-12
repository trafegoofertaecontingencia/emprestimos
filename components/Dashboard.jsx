"use client";
import { useLoanContext } from "../context/LoanContext";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const { loans } = useLoanContext();

  const [tick, setTick] = useState(0);
  const hoje = new Date();

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1); // força atualização
    }, 60000); // a cada 60 segundos
    return () => clearInterval(interval);
  }, []);

  let totalCapital = 0;
  let totalJurosProjetado = 0;
  let vencidos = 0;
  let emDia = 0;
  let ultimoPagamento = null;

  const clientesVencidos = [];

  loans.forEach((loan) => {
    totalCapital += loan.capital;
    totalJurosProjetado += loan.capital * loan.interestRate;

    const ultimo = loan.transactions.length > 0
      ? loan.transactions.reduce((a, b) =>
          new Date(a.paidAt) > new Date(b.paidAt) ? a : b
        ).paidAt
      : loan.startDate;

    const diasDesdeUltimo = Math.floor(
      (hoje - new Date(ultimo)) / (1000 * 60 * 60 * 24)
    );

    if (diasDesdeUltimo >= loan.termDays - 1) {
      vencidos++;
      clientesVencidos.push(loan.name);
    } else {
      emDia++;
    }

    loan.transactions.forEach((tx) => {
      if (!ultimoPagamento || new Date(tx.paidAt) > new Date(ultimoPagamento)) {
        ultimoPagamento = tx.paidAt;
      }
    });
  });

  return (
    <section className="bg-white p-6 rounded-xl shadow mb-8">
      <h2 className="text-xl font-bold mb-4 text-gray-800">📊 Resumo Geral</h2>

      <p className="text-sm text-gray-600 mb-6">
        📅 <strong>Hoje:</strong> {hoje.toLocaleDateString()}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700">
        <div className="p-4 border rounded bg-gray-50">
          <strong>Total de empréstimos:</strong><br /> {loans.length}
        </div>

        <div className="p-4 border rounded bg-gray-50">
          <strong>Capital emprestado:</strong><br /> R$ {totalCapital.toFixed(2)}
        </div>

        <div className="p-4 border rounded bg-gray-50">
          <strong>Juros projetados:</strong><br /> R$ {totalJurosProjetado.toFixed(2)}
        </div>

        <div className="p-4 border rounded bg-green-50 border-green-200">
          <strong>Clientes em dia:</strong><br /> {emDia}
        </div>

        <div className="p-4 border rounded bg-red-50 border-red-200">
          <strong>Clientes vencidos:</strong><br />
          {vencidos === 0 ? (
            <span>Nenhum</span>
          ) : (
            <>
              <span>{vencidos}</span>
              <ul className="mt-2 list-disc list-inside text-sm text-red-800">
                {clientesVencidos.map((nome, i) => (
                  <li key={i}>{nome}</li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div className="p-4 border rounded bg-gray-100">
          <strong>Último pagamento:</strong><br />
          {ultimoPagamento
            ? new Date(ultimoPagamento).toLocaleDateString()
            : "Nenhum ainda"}
        </div>
      </div>
    </section>
  );
}
