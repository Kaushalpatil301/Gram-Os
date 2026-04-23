import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Building, Send, DollarSign, CheckCircle2, Clock } from "lucide-react";
import { calculateCreditScore, getMockFarmerData, calculateExpectedLoan } from "../../lib/creditEngine";

export default function LoanSection({ addNotification }) {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBanks, setSelectedBanks] = useState([]);
  const [requestedAmount, setRequestedAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requests, setRequests] = useState([]);

  const farmer = getMockFarmerData();
  const credit = useMemo(() => calculateCreditScore(farmer), []);
  const maxLoanAmount = useMemo(() => calculateExpectedLoan(farmer, credit.score), [credit.score]);

  useEffect(() => {
    fetchBanks();
    fetchRequests();
  }, []);

  const fetchBanks = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/loans/banks');
      const data = await response.json();
      if (data.success) {
        setBanks(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch banks", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    // using a mocked userId since auth is not fully mocked here
    const userId = JSON.parse(localStorage.getItem("user") || "{}")._id || "mock-user-123";
    try {
      const response = await fetch(`http://localhost:8000/api/v1/loans/user-requests?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setRequests(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch requests", error);
    }
  };

  const toggleBankSelection = (bankId) => {
    setSelectedBanks(prev => 
      prev.includes(bankId) 
        ? prev.filter(id => id !== bankId)
        : [...prev, bankId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedBanks.length === 0 || !requestedAmount) return;

    setIsSubmitting(true);
    const userId = JSON.parse(localStorage.getItem("user") || "{}")._id || "mock-user-123";

    try {
      const response = await fetch('http://localhost:8000/api/v1/loans/request', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banks: selectedBanks, requestedAmount: Number(requestedAmount), userId })
      });
      const data = await response.json();
      
      if (data.success) {
        setSelectedBanks([]);
        setRequestedAmount("");
        fetchRequests(); // refresh local list
        
        // Let's simulate bank action for the first requested bank
        const requestId = data.data[0]._id;
        const bankName = data.data[0].bankName;
        
        setTimeout(() => simulateBankAction(requestId, bankName), 5000);
      }
    } catch (error) {
      console.error("Failed to submit request", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const simulateBankAction = async (requestId, bankName) => {
    try {
      // randomly accept or reject
      const action = Math.random() > 0.3 ? 'accepted' : 'rejected';
      const response = await fetch('http://localhost:8000/api/v1/loans/simulate-action', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action })
      });
      const data = await response.json();
      
      if (data.success) {
        fetchRequests(); // update the status locally
        
        // Trigger generic notification (passed down from page.jsx)
        if (addNotification) {
          addNotification({
            id: Date.now(),
            type: "loan",
            title: `Loan ${action === 'accepted' ? 'Approved' : 'Rejected'}`,
            message: `${bankName} has ${action} your loan request.`,
            status: action
          });
        }
      }
    } catch (error) {
      console.error("Failed to simulate bank action", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section with Prediction */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-xl"><DollarSign className="w-5 h-5 text-blue-700" /></div>
            Loan Requests
          </h2>
          <p className="text-gray-500">
            Apply for agricultural and micro-loans from multiple banks simultaneously.
          </p>
        </div>
        
        {/* Eligibility Card */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-700 text-white">
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-emerald-100">Estimated Eligibility Component</h3>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-black">₹{maxLoanAmount.toLocaleString("en-IN")}</span>
            </div>
            <p className="text-xs text-emerald-100 mt-2">
              Based on your credit score ({credit.score}) and platform revenue.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column: Bank Selection & Application */}
        <div className="space-y-6">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Apply for a Loan</CardTitle>
              <CardDescription>Select connected banks to request quotes from</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Required Amount (₹)</label>
                  <Input 
                    type="number" 
                    placeholder="Enter amount" 
                    value={requestedAmount}
                    onChange={(e) => setRequestedAmount(e.target.value)}
                    max={maxLoanAmount > 0 ? maxLoanAmount : undefined}
                    className="w-full text-lg"
                    required
                  />
                  {requestedAmount > maxLoanAmount && maxLoanAmount > 0 && (
                    <p className="text-xs text-amber-600 mt-1">Requested amount exceeds estimated eligibility. The bank may reject this.</p>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Banks</label>
                  {loading ? (
                    <div className="animate-pulse space-y-3">
                      {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl w-full"></div>)}
                    </div>
                  ) : (
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                      {banks.map(bank => (
                        <div 
                          key={bank.id} 
                          onClick={() => toggleBankSelection(bank.id)}
                          className={`p-3 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                            selectedBanks.includes(bank.id) 
                              ? "border-blue-500 bg-blue-50" 
                              : "border-gray-100 bg-white hover:border-gray-200"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{bank.logo}</span>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{bank.name}</p>
                              <p className="text-xs text-gray-500">Interest from {bank.interestRate}%</p>
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                            selectedBanks.includes(bank.id) ? "border-blue-500 bg-blue-500" : "border-gray-300"
                          }`}>
                            {selectedBanks.includes(bank.id) && <CheckCircle2 className="w-3 h-3 text-white" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting || selectedBanks.length === 0 || !requestedAmount}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all flex justify-center items-center gap-2 shadow-md disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Requesting..." : "Submit Loan Request"}
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Active Applications Status */}
        <div className="space-y-6">
          <Card className="border-0 shadow-md h-full">
            <CardHeader>
              <CardTitle className="text-lg">Recent Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {requests.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Building className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No active loan requests</p>
                  <p className="text-xs text-gray-400 mt-1">Apply for a loan to see updates here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map(req => (
                    <div key={req._id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-gray-900">{req.bankName}</p>
                          <p className="text-xs text-gray-500">
                            Requested: ₹{req.requestedAmount.toLocaleString("en-IN")}
                          </p>
                        </div>
                        {req.status === 'pending' && <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100"><Clock className="w-3 h-3 mr-1"/> Pending</Badge>}
                        {req.status === 'accepted' && <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100"><CheckCircle2 className="w-3 h-3 mr-1"/> Approved</Badge>}
                        {req.status === 'rejected' && <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Rejected</Badge>}
                      </div>
                      
                      {req.remarks && (
                        <p className={`text-xs mt-2 p-2 rounded-lg ${
                          req.status === 'accepted' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                        }`}>
                          {req.remarks}
                        </p>
                      )}
                      <p className="text-[10px] text-gray-400 mt-2">
                        Applied on: {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
