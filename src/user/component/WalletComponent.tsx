import { useState } from "react";
import type { ChangeEvent } from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Bell,
  CreditCard,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

interface Card {
  id: number;
  number: string;
  mm: string;
  yy: string;
  cvv: string;
  name: string;
}

interface FormData {
  cardNumber: string;
  mm: string;
  yy: string;
  cvv: string;
  name: string;
}

interface Transaction {
  bank: string;
  amount: number;
  date: string;
  status: string;
}

export default function WalletComponent() {
  const [view, setView] = useState<"empty" | "main" | "addCard">("empty");
  const [walletBalance] = useState(5674.5);
  const [storedCards, setStoredCards] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({
    cardNumber: "",
    mm: "",
    yy: "",
    cvv: "",
    name: "",
  });

  const [transactions] = useState<Transaction[]>([
    {
      bank: "Guarantee Trust Bank",
      amount: 350,
      date: "Dec 30, 2019 05:18",
      status: "Successful",
    },
    {
      bank: "Fidelity Bank",
      amount: 480,
      date: "Mar 20, 2019 23:14",
      status: "Successful",
    },
    {
      bank: "Kuda Bank",
      amount: 1200,
      date: "Dec 30, 2019 05:18",
      status: "Declined",
    },
    {
      bank: "Kuda Bank",
      amount: 1460,
      date: "Dec 7, 2019 23:26",
      status: "Declined",
    },
    {
      bank: "Kuda Bank",
      amount: 740,
      date: "Mar 20, 2019 23:14",
      status: "Successful",
    },
    {
      bank: "Guarantee Trust Bank",
      amount: 2410,
      date: "Feb 2, 2019 19:28",
      status: "Successful",
    },
    {
      bank: "Kuda",
      amount: 100,
      date: "Feb 2, 2019 19:28",
      status: "Successful",
    },
    {
      bank: "Fidelity Bank",
      amount: 2000,
      date: "Dec 4, 2019 21:42",
      status: "Successful",
    },
    {
      bank: "Union Bank for Africa",
      amount: 930,
      date: "Dec 30, 2019 07:52",
      status: "Successful",
    },
  ]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddCard = () => {
    if (
      formData.cardNumber &&
      formData.mm &&
      formData.yy &&
      formData.cvv &&
      formData.name
    ) {
      const newCard = {
        id: Date.now(),
        number: formData.cardNumber,
        mm: formData.mm,
        yy: formData.yy,
        cvv: formData.cvv,
        name: formData.name,
      };
      setStoredCards([...storedCards, newCard]);
      setSelectedCard(newCard.id);
      setFormData({ cardNumber: "", mm: "", yy: "", cvv: "", name: "" });
      setView("main");
    }
  };

  const handleRemoveCard = (cardId: number) => {
    setStoredCards(storedCards.filter((card) => card.id !== cardId));
    if (selectedCard === cardId) {
      setSelectedCard(storedCards.length > 1 ? storedCards[0].id : null);
    }
  };

  const handleBackFromAddCard = () => {
    setFormData({ cardNumber: "", mm: "", yy: "", cvv: "", name: "" });
    setView(storedCards.length > 0 ? "main" : "empty");
  };

  // Empty state
  if (view === "empty") {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-50">
          <Link to="/profile">
            <button className="text-gray-600 hover:text-gray-900 transition">
              <ArrowLeft size={24} />
            </button>
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Payment</h1>
          <button className="text-gray-400 hover:text-gray-600 transition">
            <Bell size={24} />
          </button>
        </div>

        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <div className="text-center">
            <div className="mb-8 flex justify-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
                <CreditCard size={48} className="text-emerald-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No Payment Methods
            </h2>
            <p className="text-gray-600 text-center text-sm mb-8 max-w-xs">
              Add a payment method to get started with seamless transactions
            </p>
            <button
              onClick={() => setView("main")}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 py-3 rounded-lg font-semibold transition transform hover:scale-105 inline-flex items-center gap-2 shadow-lg"
            >
              <Plus size={20} />
              Add Payment Method
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Add card form
  if (view === "addCard") {
    return (
      <div className="bg-gray-50 min-h-screen pb-32">
        <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-4 sticky top-0 z-50">
          <button
            onClick={handleBackFromAddCard}
            className="text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Add Card</h1>
        </div>

        <div className="p-6 max-w-2xl mx-auto">
          {/* Card Preview */}
          <div className="mb-8">
            <div className="relative h-56 rounded-2xl overflow-hidden group cursor-pointer shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

              <div className="relative h-full p-6 flex flex-col justify-between text-white">
                <div className="flex justify-between items-start">
                  <div className="w-14 h-10 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-900">
                      CARD
                    </span>
                  </div>
                  <Bell size={20} className="opacity-50" />
                </div>

                <div>
                  <p className="text-xs opacity-75 mb-2">Card Number</p>
                  <p className="text-2xl font-light tracking-widest mb-6">
                    {formData.cardNumber || "•••• •••• •••• ••••"}
                  </p>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs opacity-75 mb-1">Card Holder</p>
                      <p className="text-sm font-medium">
                        {formData.name || "Your Name"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs opacity-75 mb-1">Valid Thru</p>
                      <p className="text-sm font-medium">
                        {formData.mm || "MM"}/{formData.yy || "YY"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-gray-700 font-semibold text-sm block mb-3">
                Card Number
              </label>
              <input
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleInputChange}
                placeholder="1234 5678 9101 1121"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition"
                maxLength={16}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-700 font-semibold text-sm block mb-3">
                  Expiry Month
                </label>
                <input
                  type="text"
                  name="mm"
                  value={formData.mm}
                  onChange={handleInputChange}
                  placeholder="MM"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition"
                  maxLength={2}
                />
              </div>
              <div>
                <label className="text-gray-700 font-semibold text-sm block mb-3">
                  Expiry Year
                </label>
                <input
                  type="text"
                  name="yy"
                  value={formData.yy}
                  onChange={handleInputChange}
                  placeholder="YY"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition"
                  maxLength={2}
                />
              </div>
            </div>

            <div>
              <label className="text-gray-700 font-semibold text-sm block mb-3">
                CVV
              </label>
              <input
                type="text"
                name="cvv"
                value={formData.cvv}
                onChange={handleInputChange}
                placeholder="•••"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition"
                maxLength={3}
              />
            </div>

            <div>
              <label className="text-gray-700 font-semibold text-sm block mb-3">
                Cardholder Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="John Doe"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition"
              />
            </div>
          </div>
        </div>

        <div className="fixed bottom-6 left-0 right-0 px-4 max-w-2xl mx-auto w-full">
          <button
            onClick={handleAddCard}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-4 rounded-lg font-semibold transition transform hover:scale-105 shadow-lg"
          >
            Add Card
          </button>
        </div>
      </div>
    );
  }

  // Main payment view
  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <button
          onClick={() => setView("empty")}
          className="text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Payment</h1>
        <button className="text-gray-400 hover:text-gray-600 transition">
          <Bell size={24} />
        </button>
      </div>

      {/* Wallet Section */}
      <div className="px-4 pt-6">
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-8 border border-emerald-200 shadow-md">
          <p className="text-emerald-700 text-sm font-medium mb-2">
            Available Balance
          </p>
          <div className="flex items-end justify-between">
            <h1 className="text-5xl font-bold text-emerald-600">
              $
              {walletBalance.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </h1>
            <button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition shadow-lg">
              + Add Funds
            </button>
          </div>
        </div>
      </div>

      {/* Stored Cards Section */}
      <div className="px-4 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 text-lg">Payment Cards</h2>
        </div>

        {storedCards.length > 0 ? (
          <div>
            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {storedCards.map((card) => (
                <div key={card.id} className="relative group cursor-pointer">
                  <div
                    onClick={() => setSelectedCard(card.id)}
                    className={`relative h-48 rounded-xl overflow-hidden transition-all duration-300 border-2 ${
                      selectedCard === card.id
                        ? "border-emerald-500 shadow-lg"
                        : "border-transparent shadow-md hover:shadow-lg"
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800"></div>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-t from-black/20 to-transparent transition duration-300"></div>

                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl"></div>

                    <div className="relative h-full p-6 flex flex-col justify-between text-white">
                      <div className="flex justify-between items-start">
                        <div className="w-12 h-8 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded flex items-center justify-center">
                          <span className="text-xs font-bold text-gray-900">
                            CARD
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-white/60">Debit</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-lg font-light tracking-widest mb-4">
                          {card.number}
                        </p>
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-xs text-white/60 mb-1">
                              Card Holder
                            </p>
                            <p className="text-sm font-medium">{card.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-white/60 mb-1">
                              Valid Thru
                            </p>
                            <p className="text-sm font-medium">
                              {card.mm}/{card.yy}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveCard(card.id);
                    }}
                    className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <Trash2 size={16} />
                  </button>

                  {/* Selected Badge */}
                  {selectedCard === card.id && (
                    <div className="absolute bottom-3 left-3 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <CheckCircle size={14} />
                      Selected
                    </div>
                  )}
                </div>
              ))}

              {/* Add Card Button */}
              <button
                onClick={() => setView("addCard")}
                className="relative h-48 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 hover:border-emerald-500 bg-white hover:bg-emerald-50 transition group flex flex-col items-center justify-center"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition mb-3">
                  <Plus size={32} className="text-emerald-600" />
                </div>
                <p className="text-gray-900 font-semibold">Add Card</p>
                <p className="text-gray-500 text-sm mt-1">Add new card</p>
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setView("addCard")}
            className="w-full border-2 border-dashed border-gray-300 rounded-xl p-12 flex flex-col items-center justify-center text-gray-600 hover:border-emerald-500 hover:text-emerald-600 transition group bg-white hover:bg-emerald-50"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-4 group-hover:bg-emerald-200 transition">
              <Plus size={40} className="text-emerald-600" />
            </div>
            <p className="text-lg font-semibold">Add Payment Card</p>
            <p className="text-sm text-gray-500 mt-1">
              Securely add your card details
            </p>
          </button>
        )}
      </div>

      {/* Transaction History */}
      <div className="px-4 pt-8">
        <h2 className="text-center text-emerald-600 font-semibold text-lg mb-6">
          Transaction History
        </h2>
        <div className="space-y-3">
          {transactions.map((tx, idx) => (
            <div
              key={idx}
              className="bg-white p-4 rounded-lg flex items-center justify-between hover:shadow-md transition border border-gray-200"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CreditCard size={20} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {tx.bank}
                  </h3>
                  <p className="text-xs text-gray-500">{tx.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  ${tx.amount.toLocaleString()}
                </p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  {tx.status === "Successful" ? (
                    <>
                      <CheckCircle size={14} className="text-emerald-600" />
                      <p className="text-xs font-medium text-emerald-600">
                        {tx.status}
                      </p>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={14} className="text-red-600" />
                      <p className="text-xs font-medium text-red-600">
                        {tx.status}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
