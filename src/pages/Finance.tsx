
import { useState, useEffect } from "react";
import {
  Wallet,
  CreditCard,
  CalendarDays,
  Download,
  ArrowRight,
  CheckCircle2,
  Clock3,
  ReceiptText,
  ShieldCheck,
  X,
  GraduationCap,
  AlertTriangle,
} from "lucide-react";
import { getMyFinance, createOnlinePaymentSession, verifyPayment } from "../services/finance.service";

type PlanType = "full" | "annual" | "semester";

const COURSE_FEE = 240000; // Demo amount - replace with the approved IJSE fee.

const paymentPlans = [
  {
    id: "full" as PlanType,
    title: "Full Payment",
    description: "Pay the complete course fee at once.",
    installments: 1,
    installmentLabel: "One payment",
    icon: Wallet,
  },
  {
    id: "annual" as PlanType,
    title: "Annual Payment",
    description: "Pay the course fee once every year.",
    installments: 2,
    installmentLabel: "2 yearly payments",
    icon: CalendarDays,
  },
  {
    id: "semester" as PlanType,
    title: "Semester-wise Payment",
    description: "Pay every six months.",
    installments: 4,
    installmentLabel: "4 semester payments",
    icon: CreditCard,
  },
];

const paymentHistory = [
  {
    id: "PAY-001",
    description: "Semester 1 Payment",
    date: "2026-09-15",
    amount: 60000,
    status: "Paid",
  },
];

const formatCurrency = (amount: number) =>
  `LKR ${amount.toLocaleString("en-US")}`;

function Finance() {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("semester");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [totalCourseFee, setTotalCourseFee] = useState(COURSE_FEE);
  const [history, setHistory] = useState(paymentHistory);
  const [warnings, setWarnings] = useState<any[]>([]);
  const [payLoading, setPayLoading] = useState(false);
  const [paySuccessMsg, setPaySuccessMsg] = useState("");

  const fetchFinance = async () => {
    try {
      const data = await getMyFinance();
      if (data?.schedule) {
        setTotalCourseFee(data.schedule.totalFee || COURSE_FEE);
      }
      if (data?.transactions && data.transactions.length > 0) {
        const mapped = data.transactions.map((tx: any, idx: number) => ({
          id: tx.receiptNo || tx.reference || `PAY-00${idx + 1}`,
          description: `${tx.method} Payment`,
          date: tx.date || (tx.createdAt ? new Date(tx.createdAt).toISOString().slice(0, 10) : "2026-11-15"),
          amount: tx.amount,
          status: tx.status === "SUCCESS" ? "Paid" : tx.status,
        }));
        setHistory(mapped);
      }
      if (data?.warnings) {
        setWarnings(data.warnings);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchFinance();
  }, []);

  const selectedPlanDetails = paymentPlans.find(
    (plan) => plan.id === selectedPlan
  )!;

  const installmentAmount =
    totalCourseFee / selectedPlanDetails.installments;

  const paidAmount = history
    .filter((payment) => payment.status === "Paid")
    .reduce((total, payment) => total + payment.amount, 0);

  const outstandingAmount = Math.max(
    totalCourseFee - paidAmount,
    0
  );

  const nextPaymentAmount = Math.min(
    installmentAmount,
    outstandingAmount
  );

  const paymentProgress = Math.min(
    (paidAmount / totalCourseFee) * 100,
    100
  );

  const visibleHistory = showAllHistory
    ? history
    : history.slice(0, 3);

  const handlePayOnline = async () => {
    setPayLoading(true);
    setPaySuccessMsg("");
    try {
      const session = await createOnlinePaymentSession(nextPaymentAmount);
      if (session?.sessionId) {
        await verifyPayment(session.sessionId);
        setPaySuccessMsg(`Payment of ${formatCurrency(nextPaymentAmount)} confirmed! Receipt generated.`);
        fetchFinance();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Payment session error");
    } finally {
      setPayLoading(false);
    }
  };

  return (
    <div className="space-y-8">

      {/* Page Heading */}
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Student Portal</span>
          <ArrowRight size={14} />
          <span className="font-medium text-[#D71920]">
            Finance
          </span>
        </div>

        <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#171717]">
              Finance & Payments
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Manage your course fees, payment plans and payment history.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3">
            <GraduationCap className="text-[#D71920]" size={22} />
            <div>
              <p className="text-xs text-gray-500">Your Course</p>
              <p className="text-sm font-bold text-gray-900">
                HDSE - Batch 75
              </p>
            </div>
          </div>
        </div>
      </div>

      {warnings && warnings.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-[#D71920]" size={20} />
            <div>
              <p className="text-sm font-bold text-red-900">Payment Notice</p>
              <p className="text-xs text-red-700">{warnings[0]?.reason || warnings[0]?.message || "Please ensure pending fee installments are settled on time."}</p>
            </div>
          </div>
        </div>
      )}

      {/* Financial Summary */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">
              Total Course Fee
            </p>
            <Wallet className="text-[#D71920]" size={22} />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            {formatCurrency(COURSE_FEE)}
          </h2>
          <p className="mt-2 text-xs text-gray-500">
            Complete 2-year HDSE course
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">
              Total Paid
            </p>
            <CheckCircle2 className="text-green-600" size={22} />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-green-600">
            {formatCurrency(paidAmount)}
          </h2>
          <p className="mt-2 text-xs text-gray-500">
            Confirmed payments
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">
              Outstanding Balance
            </p>
            <Clock3 className="text-orange-500" size={22} />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-orange-600">
            {formatCurrency(outstandingAmount)}
          </h2>
          <p className="mt-2 text-xs text-gray-500">
            Remaining course fee
          </p>
        </div>

      </div>

      {/* Payment Progress */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Payment Progress
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Your course fee payment progress
            </p>
          </div>

          <span className="text-2xl font-bold text-[#D71920]">
            {paymentProgress.toFixed(0)}%
          </span>
        </div>

        <div className="mt-5 h-3 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-[#D71920] transition-all"
            style={{ width: `${paymentProgress}%` }}
          />
        </div>

        <div className="mt-3 flex justify-between text-xs text-gray-500">
          <span>Paid: {formatCurrency(paidAmount)}</span>
          <span>Total: {formatCurrency(COURSE_FEE)}</span>
        </div>
      </section>

      {/* Select Payment Plan */}
      <section>
        <div className="mb-5">
          <h2 className="text-xl font-bold text-gray-900">
            Choose Your Payment Plan
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Select how you want to pay your two-year course fee.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

          {paymentPlans.map((plan) => {
            const Icon = plan.icon;
            const isSelected = selectedPlan === plan.id;

            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedPlan(plan.id)}
                className={`rounded-2xl border-2 p-6 text-left transition ${
                  isSelected
                    ? "border-[#D71920] bg-red-50/40"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className={`rounded-xl p-3 ${
                    isSelected
                      ? "bg-[#D71920] text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    <Icon size={23} />
                  </div>

                  {isSelected && (
                    <CheckCircle2
                      size={22}
                      className="text-[#D71920]"
                    />
                  )}
                </div>

                <h3 className="mt-5 text-lg font-bold text-gray-900">
                  {plan.title}
                </h3>

                <p className="mt-2 min-h-10 text-sm text-gray-500">
                  {plan.description}
                </p>

                <div className="mt-5 border-t border-gray-200 pt-4">
                  <p className="text-xs text-gray-500">
                    Payment amount
                  </p>

                  <p className="mt-1 text-xl font-bold text-gray-900">
                    {formatCurrency(COURSE_FEE / plan.installments)}
                  </p>

                  <p className="mt-2 text-xs font-medium text-gray-500">
                    {plan.installmentLabel}
                  </p>
                </div>
              </button>
            );
          })}

        </div>
      </section>

      {/* Selected Plan Details */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Your Selected Payment Plan
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Review the payment details before proceeding.
            </p>
          </div>

          <span className="w-fit rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-[#D71920]">
            {selectedPlanDetails.title}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs text-gray-500">
              Number of Payments
            </p>
            <p className="mt-2 text-xl font-bold text-gray-900">
              {selectedPlanDetails.installments}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs text-gray-500">
              Instalment Amount
            </p>
            <p className="mt-2 text-xl font-bold text-gray-900">
              {formatCurrency(installmentAmount)}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs text-gray-500">
              Next Payment Amount
            </p>
            <p className="mt-2 text-xl font-bold text-[#D71920]">
              {formatCurrency(nextPaymentAmount)}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col justify-between gap-4 rounded-xl border border-gray-200 p-4 sm:flex-row sm:items-center">
          <div>
            <p className="font-semibold text-gray-900">
              Ready to make your payment?
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Continue to the secure online payment process.
            </p>
          </div>

          <button
            type="button"
            disabled={outstandingAmount === 0}
            onClick={() => setShowPaymentModal(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#D71920] px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            Pay Now
            <ArrowRight size={17} />
          </button>
        </div>
      </section>

      {/* Payment History */}
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="flex flex-col justify-between gap-3 border-b border-gray-200 p-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Payment History
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              View your previous payments and receipts.
            </p>
          </div>

          <ReceiptText className="text-[#D71920]" size={25} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-4">Payment ID</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Receipt</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {visibleHistory.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    {payment.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {payment.description}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {payment.date}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    {formatCurrency(payment.amount)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      title="Receipt download will be connected to the backend"
                      className="text-gray-500 hover:text-[#D71920]"
                    >
                      <Download size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {paymentHistory.length === 0 && (
          <div className="p-8 text-center text-sm text-gray-500">
            No payment records found.
          </div>
        )}

        {paymentHistory.length > 3 && (
          <div className="border-t border-gray-100 p-4 text-center">
            <button
              type="button"
              onClick={() => setShowAllHistory(!showAllHistory)}
              className="text-sm font-semibold text-[#D71920]"
            >
              {showAllHistory ? "Show Less" : "View All Payments"}
            </button>
          </div>
        )}
      </section>

      {/* Security Note */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
        <ShieldCheck className="mt-0.5 shrink-0 text-blue-600" size={21} />
        <div>
          <p className="text-sm font-semibold text-blue-900">
            Secure Online Payments
          </p>
          <p className="mt-1 text-xs leading-5 text-blue-800">
            Online payments will be processed through an approved payment
            gateway. Payment status will update only after the backend
            verifies the gateway confirmation.
          </p>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Online Payment
              </h2>

              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-5 rounded-xl bg-gray-50 p-5">
              <p className="text-sm text-gray-500">
                Selected payment plan
              </p>

              <p className="mt-1 font-bold text-gray-900">
                {selectedPlanDetails.title}
              </p>

              <p className="mt-5 text-sm text-gray-500">
                Amount to pay
              </p>

              <p className="mt-1 text-3xl font-bold text-[#D71920]">
                {formatCurrency(nextPaymentAmount)}
              </p>
            </div>

            {paySuccessMsg ? (
              <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 text-xs">
                <p className="font-bold text-sm mb-1">Payment Successful!</p>
                <p>{paySuccessMsg}</p>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="mt-4 w-full rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 text-blue-600" size={21} />
                    <div>
                      <p className="text-sm font-semibold text-blue-900">
                        Secure Card Checkout
                      </p>
                      <p className="mt-1 text-xs leading-5 text-blue-800">
                        Processed securely via IJSE payment gateway. Instant receipt issued upon confirmation.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={payLoading}
                    onClick={handlePayOnline}
                    className="flex-1 rounded-xl bg-[#D71920] px-4 py-3 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {payLoading ? "Processing..." : `Pay ${formatCurrency(nextPaymentAmount)}`}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

export default Finance;
