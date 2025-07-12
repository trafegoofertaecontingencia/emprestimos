"use client";
import { useLoanContext } from "../context/LoanContext";
import { v4 as uuidv4 } from "uuid";

export default function LoanList() {
  const { state, dispatch } = useLoanContext();
  const loans = state.loans;

  function calcularDias(d1, d2) {
    const ms = new Date(d2) - new Date(d1);
    return Math.floor(ms / (1000 * 60 * 60 * 24));
  }

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
    const loan = loans.find(l => l.id === id);
    const juros = calcularJuros(loan);

    const tx = {
      id: uuidv4(),
      amount: juros,
      type: "INTEREST",
      paidAt: new Date().toISOString()
    };

    dispatch({
      type: "ADD_TRANSACTION",
      payload: {
        loanId: id,
        transaction: tx
      }
    });

    alert("Juros pagos.");
  }

  function abaterCapital(id) {
    const valor = parseFloat(prompt("Digite quanto deseja abater do capital:"));
    if (!valor || valor <= 0) return;

    const tx = {
      id: uuidv4(),
      amount: valor,
      type: "BOTH",
      paidAt: new Date().toISOString()
    };

    dispatch({
      type: "ADD_TRANSACTION",
      payload: {
        loanId: id,
        transaction: tx
      }
    });

    alert("Juros e capital abatidos.");
  }

  function quitarTudo(id) {
    const confirmou = confirm("Tem certeza que deseja quitar este empréstimo? Isso irá registrá-lo como totalmente pago e removê-lo da lista.");
    if (!confirmou) return;

    const loan = loans.find(l => l.id === id);
    const juros = calcularJuros(loan);

    const txJuros = {
      id: uuidv4(),
      amount: juros,
      type: "INTEREST",
      paidAt: new Date().toISOString()
    };

    const txCapital = {
      id: uuidv4(),
      amount: loan.capital,
      type: "CAPITAL",
      paidAt: new Date().toISOString()
    };

    dispatch({
      type: "ADD_TRANSACTION",
      payload: { loanId: id, transaction: txJuros }
    });

    dispatch({
      type: "ADD_TRANSACTION",
      payload: { loanId: id, transaction: txCapital }
    });

    dispatch({ type: "DELETE_LOAN", payload: id });

    alert("Empréstimo quitado com sucesso.");
  }

  return (
    <div className="space-y-6">
      {loans.length === 0 && (
        <p className="text-gray-500">Nenhum empréstimo cadastrado ainda.</p>
      )}

      {loans.map(loan => {
        const juros = calcularJuros(loan);
        const diasDesdeUltimo = calcularDias(calcularUltimoPagamento(loan), new Date());
        const vencimentoEm = loan.termDays - diasDesdeUltimo;
        const vencido = diasDesdeUltimo >= loan.termDays;

        return (
          <div
            key={loan.id}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{loan.name}</h3>
              <span className="text-sm text-gray-500">ID: {loan.id.slice(0, 6)}...</span>
            </div>

            <ul className="text-sm space-y-1 mb-4">
              <li>📦 Capital atual: <strong>R$ {loan.capital.toFixed(2)}</strong></li>
              <li>💸 Juros: <strong>R$ {juros.toFixed(2)}</strong></li>
              <li>⏱️ Vencimento: <strong>{vencido ? "Vencido" : `em ${vencimentoEm} dias`}</strong></li>
              <li>📅 Último pagamento: <strong>{new Date(calcularUltimoPagamento(loan)).toLocaleDateString()}</strong></li>
              <li>📆 Criado em: <strong>{new Date(loan.startDate).toLocaleDateString()}</strong></li>
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
                {vencido ? "Pagar juros (vencido)" : "Pagar juros antecipado"}
              </button>

              <button
                onClick={() => abaterCapital(loan.id)}
                className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Pagar juros + abater capital
              </button>

              <button
                onClick={() => quitarTudo(loan.id)}
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
