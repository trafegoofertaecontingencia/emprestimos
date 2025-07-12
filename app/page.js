import { LoanProvider } from "../context/LoanContext";
import Dashboard from "../components/Dashboard";
import LoanForm from "../components/LoanForm";
import LoanList from "../components/LoanList";

export default function HomePage() {
  return (
    <LoanProvider>
      <main className="bg-white min-h-screen py-10 px-4 md:px-12 text-gray-800">
        <div className="max-w-5xl mx-auto space-y-10">
          <Dashboard />
          <section className="bg-gray-100 p-6 rounded-xl shadow">
            <LoanForm />
          </section>
          <section className="bg-gray-100 p-6 rounded-xl shadow">
            <LoanList />
          </section>
        </div>
      </main>
    </LoanProvider>
  );
}
