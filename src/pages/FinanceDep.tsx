
import { useMemo, useState, type FormEvent } from "react";
import {
  LayoutDashboard,
  Wallet,
  Users,
  Receipt,
  TrendingUp,
  Search,
  Plus,
  X,
  CreditCard,
  Banknote,
  CalendarDays,
  Download,
} from "lucide-react";

type Tab = "overview" | "payments" | "transactions" | "reports";
type PaymentStatus = "PAID" | "PARTIAL" | "UNPAID";

type StudentPayment = {
  id: number;
  studentId: string;
  name: string;
  batch: string;
  course: string;
  totalFee: number;
  paid: number;
};

type Transaction = {
  id: number;
  studentId: string;
  studentName: string;
  batch: string;
  amount: number;
  method: string;
  date: string;
  reference: string;
};

const initialStudents: StudentPayment[] = [
  {
    id: 1,
    studentId: "IJSE-001",
    name: "Hiruni Hewaarachchi",
    batch: "GDSE 75",
    course: "Graduate Diploma in Software Engineering",
    totalFee: 250000,
    paid: 150000,
  },
  {
    id: 2,
    studentId: "IJSE-002",
    name: "Amal Perera",
    batch: "GDSE 75",
    course: "Graduate Diploma in Software Engineering",
    totalFee: 250000,
    paid: 250000,
  },
  {
    id: 3,
    studentId: "IJSE-003",
    name: "Nethmi Silva",
    batch: "GDSE 75",
    course: "Graduate Diploma in Software Engineering",
    totalFee: 250000,
    paid: 75000,
  },
  {
    id: 4,
    studentId: "IJSE-004",
    name: "Kavindu Fernando",
    batch: "GDSE 76",
    course: "Graduate Diploma in Software Engineering",
    totalFee: 250000,
    paid: 100000,
  },
  {
    id: 5,
    studentId: "IJSE-005",
    name: "Tharushi Jayasinghe",
    batch: "GDSE 76",
    course: "Graduate Diploma in Software Engineering",
    totalFee: 250000,
    paid: 0,
  },
  {
    id: 6,
    studentId: "IJSE-006",
    name: "Pasindu Perera",
    batch: "CMJD 110",
    course: "Comprehensive Master in Java Development",
    totalFee: 180000,
    paid: 180000,
  },
];

const initialTransactions: Transaction[] = [
  {
    id: 1,
    studentId: "IJSE-001",
    studentName: "Hiruni Hewaarachchi",
    batch: "GDSE 75",
    amount: 100000,
    method: "Bank Transfer",
    date: "2026-11-01",
    reference: "TRX-1001",
  },
  {
    id: 2,
    studentId: "IJSE-002",
    studentName: "Amal Perera",
    batch: "GDSE 75",
    amount: 250000,
    method: "Bank Transfer",
    date: "2026-11-02",
    reference: "TRX-1002",
  },
  {
    id: 3,
    studentId: "IJSE-003",
    studentName: "Nethmi Silva",
    batch: "GDSE 75",
    amount: 75000,
    method: "Cash",
    date: "2026-11-05",
    reference: "TRX-1003",
  },
  {
    id: 4,
    studentId: "IJSE-004",
    studentName: "Kavindu Fernando",
    batch: "GDSE 76",
    amount: 100000,
    method: "Card",
    date: "2026-11-08",
    reference: "TRX-1004",
  },
];

const formatCurrency = (amount: number) =>
  `LKR ${amount.toLocaleString("en-LK")}`;

function FinanceDep() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [students, setStudents] = useState(initialStudents);
  const [transactions, setTransactions] = useState(initialTransactions);

  const [selectedBatch, setSelectedBatch] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("ALL");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [paymentForm, setPaymentForm] = useState({
    studentId: "",
    amount: "",
    method: "Bank Transfer",
    date: "2026-11-15",
    reference: "",
  });

  const batches = [...new Set(students.map((student) => student.batch))];

  const getStatus = (student: StudentPayment): PaymentStatus => {
    if (student.paid >= student.totalFee) return "PAID";
    if (student.paid > 0) return "PARTIAL";
    return "UNPAID";
  };

  const totalRevenue = students.reduce(
    (sum, student) => sum + student.totalFee,
    0
  );

  const totalCollected = students.reduce(
    (sum, student) => sum + student.paid,
    0
  );

  const totalOutstanding = totalRevenue - totalCollected;

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesBatch =
        selectedBatch === "ALL" || student.batch === selectedBatch;

      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        paymentStatus === "ALL" ||
        getStatus(student) === paymentStatus;

      return matchesBatch && matchesSearch && matchesStatus;
    });
  }, [students, selectedBatch, searchTerm, paymentStatus]);

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesBatch =
      selectedBatch === "ALL" || transaction.batch === selectedBatch;

    const matchesSearch =
      transaction.studentName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.reference
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    return matchesBatch && matchesSearch;
  });

  const batchSummary = batches.map((batch) => {
    const batchStudents = students.filter(
      (student) => student.batch === batch
    );

    const expected = batchStudents.reduce(
      (sum, student) => sum + student.totalFee,
      0
    );

    const collected = batchStudents.reduce(
      (sum, student) => sum + student.paid,
      0
    );

    return {
      batch,
      studentCount: batchStudents.length,
      expected,
      collected,
      outstanding: expected - collected,
    };
  });

  const recordPayment = (e: FormEvent) => {
    e.preventDefault();

    const student = students.find(
      (item) => item.studentId === paymentForm.studentId
    );

    const amount = Number(paymentForm.amount);

    if (!student || !Number.isFinite(amount) || amount <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }

    if (amount > student.totalFee - student.paid) {
      alert("Payment cannot exceed the student's outstanding balance.");
      return;
    }

    if (!paymentForm.reference.trim()) {
      alert("Please enter a payment reference.");
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now(),
      studentId: student.studentId,
      studentName: student.name,
      batch: student.batch,
      amount,
      method: paymentForm.method,
      date: paymentForm.date,
      reference: paymentForm.reference,
    };

    setStudents((previous) =>
      previous.map((item) =>
        item.id === student.id
          ? { ...item, paid: item.paid + amount }
          : item
      )
    );

    setTransactions((previous) => [
      newTransaction,
      ...previous,
    ]);

    setShowPaymentModal(false);

    setPaymentForm({
      studentId: "",
      amount: "",
      method: "Bank Transfer",
      date: "2026-11-15",
      reference: "",
    });
  };

  const selectedStudent = students.find(
    (student) => student.studentId === paymentForm.studentId
  );

  const statusStyle = (status: string) => {
    if (status === "PAID")
      return "bg-green-100 text-green-700";
    if (status === "PARTIAL")
      return "bg-yellow-100 text-yellow-700";
    if (status === "UNPAID")
      return "bg-red-100 text-red-700";

    return "bg-gray-100 text-gray-600";
  };

  const inputStyle =
    "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-red-500";

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "payments", label: "Student Payments", icon: Users },
    { id: "transactions", label: "Transactions", icon: Receipt },
    { id: "reports", label: "Finance Reports", icon: TrendingUp },
  ] as const;

  return (
    <div className="space-y-7">

      {/* PAGE HEADER */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-red-600">
            IJSE / Finance Department
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Finance Management
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage student fees, payments and batch-wise financial records.
          </p>
        </div>

        <button
          onClick={() => setShowPaymentModal(true)}
          className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700"
        >
          <Plus size={18} />
          Record Payment
        </button>
      </div>

      {/* NAVIGATION */}
      <div className="flex gap-2 overflow-x-auto border-b border-gray-200">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold ${
                activeTab === item.id
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              <Icon size={17} />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Total Expected Fees",
                value: formatCurrency(totalRevenue),
                icon: Wallet,
                color: "bg-blue-50 text-blue-600",
              },
              {
                label: "Total Collected",
                value: formatCurrency(totalCollected),
                icon: Banknote,
                color: "bg-green-50 text-green-600",
              },
              {
                label: "Outstanding Balance",
                value: formatCurrency(totalOutstanding),
                icon: CreditCard,
                color: "bg-red-50 text-red-600",
              },
              {
                label: "Registered Students",
                value: students.length,
                icon: Users,
                color: "bg-purple-50 text-purple-600",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-gray-500">{item.label}</p>
                      <h2 className="mt-2 text-xl font-bold text-gray-900">
                        {item.value}
                      </h2>
                    </div>

                    <div className={`rounded-xl p-3 ${item.color}`}>
                      <Icon size={22} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* COLLECTION PROGRESS */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex flex-col justify-between gap-2 sm:flex-row">
              <div>
                <h2 className="font-bold text-gray-900">
                  Overall Collection Progress
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Total collected fees compared with expected fees.
                </p>
              </div>

              <p className="text-2xl font-bold text-green-600">
                {totalRevenue
                  ? Math.round((totalCollected / totalRevenue) * 100)
                  : 0}%
              </p>
            </div>

            <div className="mt-5 h-3 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-green-500"
                style={{
                  width: `${
                    totalRevenue
                      ? (totalCollected / totalRevenue) * 100
                      : 0
                  }%`,
                }}
              />
            </div>

            <div className="mt-3 flex justify-between text-xs text-gray-500">
              <span>Collected: {formatCurrency(totalCollected)}</span>
              <span>Remaining: {formatCurrency(totalOutstanding)}</span>
            </div>
          </div>

          {/* BATCH SUMMARY */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-gray-900">
                  Batch-wise Financial Summary
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Financial overview of each student batch.
                </p>
              </div>

              <button
                onClick={() => setActiveTab("reports")}
                className="text-sm font-semibold text-red-600"
              >
                View Reports
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Batch</th>
                    <th className="px-4 py-3">Students</th>
                    <th className="px-4 py-3">Expected</th>
                    <th className="px-4 py-3">Collected</th>
                    <th className="px-4 py-3">Outstanding</th>
                  </tr>
                </thead>

                <tbody>
                  {batchSummary.map((batch) => (
                    <tr key={batch.batch} className="border-b border-gray-100">
                      <td className="px-4 py-4 font-bold text-gray-900">
                        {batch.batch}
                      </td>
                      <td className="px-4 py-4">{batch.studentCount}</td>
                      <td className="px-4 py-4">
                        {formatCurrency(batch.expected)}
                      </td>
                      <td className="px-4 py-4 font-semibold text-green-700">
                        {formatCurrency(batch.collected)}
                      </td>
                      <td className="px-4 py-4 font-semibold text-red-600">
                        {formatCurrency(batch.outstanding)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RECENT PAYMENTS */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-4 font-bold text-gray-900">
              Recent Payments
            </h2>

            {transactions.slice(0, 4).map((transaction) => (
              <div
                key={transaction.id}
                className="flex flex-col justify-between gap-2 border-b border-gray-100 py-4 last:border-0 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="font-semibold text-gray-900">
                    {transaction.studentName}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {transaction.studentId} · {transaction.batch}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <p className="font-bold text-green-700">
                    + {formatCurrency(transaction.amount)}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {transaction.date} · {transaction.method}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STUDENT PAYMENTS */}
      {activeTab === "payments" && (
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-gray-900">
              Student Payment Details
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              View course fees, payments and outstanding balances.
            </p>
          </div>

          <div className="mb-5 grid gap-3 md:grid-cols-3">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-3 text-gray-400"
              />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search student..."
                className={`${inputStyle} pl-10`}
              />
            </div>

            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className={inputStyle}
            >
              <option value="ALL">All Batches</option>
              {batches.map((batch) => (
                <option key={batch} value={batch}>{batch}</option>
              ))}
            </select>

            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className={inputStyle}
            >
              <option value="ALL">All Payment Statuses</option>
              <option value="PAID">Fully Paid</option>
              <option value="PARTIAL">Partially Paid</option>
              <option value="UNPAID">Unpaid</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Batch</th>
                  <th className="px-4 py-3">Course Fee</th>
                  <th className="px-4 py-3">Paid</th>
                  <th className="px-4 py-3">Balance</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredStudents.map((student) => {
                  const status = getStatus(student);

                  return (
                    <tr key={student.id} className="border-b border-gray-100">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-gray-900">
                          {student.name}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {student.studentId}
                        </p>
                      </td>

                      <td className="px-4 py-4">{student.batch}</td>

                      <td className="px-4 py-4">
                        {formatCurrency(student.totalFee)}
                      </td>

                      <td className="px-4 py-4 font-semibold text-green-700">
                        {formatCurrency(student.paid)}
                      </td>

                      <td className="px-4 py-4 font-semibold text-red-600">
                        {formatCurrency(student.totalFee - student.paid)}
                      </td>

                      <td className="px-4 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(status)}`}>
                          {status}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <button
                          onClick={() => {
                            setPaymentForm({
                              studentId: student.studentId,
                              amount: "",
                              method: "Bank Transfer",
                              date: "2026-11-15",
                              reference: "",
                            });
                            setShowPaymentModal(true);
                          }}
                          disabled={status === "PAID"}
                          className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Record Payment
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      No student records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TRANSACTIONS */}
      {activeTab === "transactions" && (
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-bold text-gray-900">
            Payment Transactions
          </h2>
          <p className="mb-5 mt-1 text-sm text-gray-500">
            Complete history of recorded student payments.
          </p>

          <div className="mb-5 grid gap-3 sm:grid-cols-2">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-3 text-gray-400"
              />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search student or reference..."
                className={`${inputStyle} pl-10`}
              />
            </div>

            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className={inputStyle}
            >
              <option value="ALL">All Batches</option>
              {batches.map((batch) => (
                <option key={batch} value={batch}>{batch}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Batch</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Amount</th>
                </tr>
              </thead>

              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-100">
                    <td className="px-4 py-4 font-semibold text-gray-700">
                      {transaction.reference}
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-gray-900">
                        {transaction.studentName}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {transaction.studentId}
                      </p>
                    </td>
                    <td className="px-4 py-4">{transaction.batch}</td>
                    <td className="px-4 py-4">{transaction.method}</td>
                    <td className="px-4 py-4">{transaction.date}</td>
                    <td className="px-4 py-4 font-bold text-green-700">
                      {formatCurrency(transaction.amount)}
                    </td>
                  </tr>
                ))}

                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* REPORTS */}
      {activeTab === "reports" && (
        <section className="space-y-5">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-lg font-bold text-gray-900">
              Finance Reports
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Financial performance and payment collection by batch.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-green-50 p-4">
                <p className="text-sm text-green-700">Total Collected</p>
                <p className="mt-2 text-xl font-bold text-green-800">
                  {formatCurrency(totalCollected)}
                </p>
              </div>

              <div className="rounded-lg bg-red-50 p-4">
                <p className="text-sm text-red-700">Outstanding</p>
                <p className="mt-2 text-xl font-bold text-red-800">
                  {formatCurrency(totalOutstanding)}
                </p>
              </div>

              <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-sm text-blue-700">Total Expected</p>
                <p className="mt-2 text-xl font-bold text-blue-800">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-5 font-bold text-gray-900">
              Batch Collection Reports
            </h2>

            {batchSummary.map((batch) => {
              const percentage = batch.expected
                ? Math.round((batch.collected / batch.expected) * 100)
                : 0;

              return (
                <div
                  key={batch.batch}
                  className="border-b border-gray-100 py-5 last:border-0"
                >
                  <div className="flex flex-col justify-between gap-2 sm:flex-row">
                    <div>
                      <p className="font-bold text-gray-900">{batch.batch}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {batch.studentCount} students
                      </p>
                    </div>

                    <div className="sm:text-right">
                      <p className="font-bold text-green-700">
                        {formatCurrency(batch.collected)}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {percentage}% collected
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-green-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <p className="mt-2 text-xs text-red-600">
                    Outstanding: {formatCurrency(batch.outstanding)}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* RECORD PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Record Student Payment
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Enter the payment details below.
                </p>
              </div>

              <button
                onClick={() => setShowPaymentModal(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={recordPayment} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Student
                </label>

                <select
                  required
                  value={paymentForm.studentId}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      studentId: e.target.value,
                    })
                  }
                  className={inputStyle}
                >
                  <option value="">Select Student</option>

                  {students
                    .filter((student) => student.paid < student.totalFee)
                    .map((student) => (
                      <option key={student.id} value={student.studentId}>
                        {student.name} - {student.batch}
                      </option>
                    ))}
                </select>
              </div>

              {selectedStudent && (
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Course Fee</span>
                    <span className="font-semibold">
                      {formatCurrency(selectedStudent.totalFee)}
                    </span>
                  </div>

                  <div className="mt-2 flex justify-between text-sm">
                    <span className="text-gray-500">Already Paid</span>
                    <span className="font-semibold text-green-700">
                      {formatCurrency(selectedStudent.paid)}
                    </span>
                  </div>

                  <div className="mt-2 flex justify-between text-sm">
                    <span className="font-semibold text-gray-700">
                      Remaining Balance
                    </span>
                    <span className="font-bold text-red-600">
                      {formatCurrency(
                        selectedStudent.totalFee - selectedStudent.paid
                      )}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Payment Amount (LKR)
                </label>

                <input
                  required
                  type="number"
                  min="1"
                  max={
                    selectedStudent
                      ? selectedStudent.totalFee - selectedStudent.paid
                      : undefined
                  }
                  value={paymentForm.amount}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      amount: e.target.value,
                    })
                  }
                  placeholder="Enter amount"
                  className={inputStyle}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Payment Method
                </label>

                <select
                  value={paymentForm.method}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      method: e.target.value,
                    })
                  }
                  className={inputStyle}
                >
                  <option>Bank Transfer</option>
                  <option>Cash</option>
                  <option>Card</option>
                  <option>Online Payment</option>
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Payment Date
                  </label>

                  <input
                    required
                    type="date"
                    value={paymentForm.date}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        date: e.target.value,
                      })
                    }
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Reference Number
                  </label>

                  <input
                    required
                    value={paymentForm.reference}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        reference: e.target.value,
                      })
                    }
                    placeholder="TRX-1005"
                    className={inputStyle}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FinanceDep;
