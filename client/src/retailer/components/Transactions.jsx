import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Download, Search, Check, Flag } from "lucide-react";
import { transactions } from "../lib/data";
import ReportIssuePopup from "./ReportIssuePopup";
import { useTranslation } from "../../consumer/i18n/config.jsx";

export default function Transactions() {
  const { t } = useTranslation();
  const [filteredTransactions, setFilteredTransactions] =
    useState(transactions);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [copiedHash, setCopiedHash] = useState("");
  const [isReportPopupOpen, setIsReportPopupOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const filterTransactions = (term, status) => {
    const filtered = transactions.filter((transaction) => {
      const matchesSearch =
        transaction.farmer.toLowerCase().includes(term.toLowerCase()) ||
        transaction.lot.toLowerCase().includes(term.toLowerCase()) ||
        transaction.hash.toLowerCase().includes(term.toLowerCase());
      const matchesStatus =
        status === "all" ||
        transaction.status.toLowerCase() === status.toLowerCase();
      return matchesSearch && matchesStatus;
    });
    setFilteredTransactions(filtered);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    filterTransactions(term, statusFilter);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    filterTransactions(searchTerm, status);
  };

  const handleReportClick = (transaction) => {
    setSelectedTransaction(transaction);
    setIsReportPopupOpen(true);
  };

  const copyToClipboard = async (hash) => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedHash(hash);
      setTimeout(() => setCopiedHash(""), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      [
        "Transaction ID",
        "Farmer",
        "Lot ID",
        "Date",
        "Amount",
        "Status",
        "Hash",
      ],
      ...filteredTransactions.map((t) => [
        t.id,
        t.farmer,
        t.lot,
        t.date,
        t.amount,
        t.status,
        t.hash,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split("T")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleReportSubmit = (reportData) => {
    console.log("Issue reported:", {
      transactionId: selectedTransaction?.id,
      ...reportData,
    });
    alert(t("transactions.reportSubmitted"));
    setSelectedTransaction(null);
  };

  const getStatusStyle = (status) => {
    const styles = {
      Confirmed: "bg-green-100 text-green-800 border-green-200",
      Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Failed: "bg-red-100 text-red-800 border-red-200",
      Completed: "bg-blue-100 text-blue-800 border-blue-200",
    };
    return styles[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusLabel = (status) => t(`status.${status.toLowerCase()}`);

  const getTotalConfirmed = () => {
    return filteredTransactions
      .filter((t) => t.status === "Confirmed")
      .reduce((sum, t) => sum + t.amount, 0);
  };

  return (
    <>
      {/* Filters */}
      <Card className="mb-6 md:mb-8 border-0 shadow-sm">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                <input
                  type="text"
                  placeholder={t("transactions.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 md:pl-12 pr-4 h-10 md:h-12 text-sm md:text-base border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <Select onValueChange={handleStatusFilter} value={statusFilter}>
              <SelectTrigger className="w-full md:w-48 h-10 md:h-12 border-gray-200">
                <SelectValue placeholder={t("transactions.allStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("transactions.allStatus")}
                </SelectItem>
                <SelectItem value="confirmed">
                  {t("transactions.confirmed")}
                </SelectItem>
                <SelectItem value="pending">
                  {t("transactions.pending")}
                </SelectItem>
                <SelectItem value="failed">
                  {t("transactions.failed")}
                </SelectItem>
                <SelectItem value="completed">
                  {t("status.completed")}
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Export Button */}
            <Button
              variant="outline"
              onClick={exportToCSV}
              className="h-10 md:h-12 px-4 md:px-6"
            >
              <Download className="w-4 h-4 mr-2" />
              {t("common.export")}
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-4 md:mt-6 grid grid-cols-2 md:flex md:flex-wrap gap-3 md:gap-6 text-xs md:text-sm bg-gray-50 p-3 md:p-4 rounded-lg">
            <span>
              {t("transactions.showing")}:{" "}
              <span className="text-blue-600">
                {filteredTransactions.length}
              </span>
              /{transactions.length}
            </span>
            <span>
              {t("transactions.confirmed")}:{" "}
              <span className="text-green-600">
                ${getTotalConfirmed().toLocaleString()}
              </span>
            </span>
            <span>
              {t("transactions.pending")}:{" "}
              <span className="text-yellow-600">
                {
                  filteredTransactions.filter((t) => t.status === "Pending")
                    .length
                }
              </span>
            </span>
            <span>
              {t("transactions.failed")}:{" "}
              <span className="text-red-600">
                {
                  filteredTransactions.filter((t) => t.status === "Failed")
                    .length
                }
              </span>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    {t("transactions.farmer")}
                  </th>
                  <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    {t("transactions.lotId")}
                  </th>
                  <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    {t("transactions.date")}
                  </th>
                  <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    {t("transactions.amount")}
                  </th>
                  <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    {t("transactions.status")}
                  </th>
                  <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-gray-900 hidden lg:table-cell">
                    {t("transactions.hash")}
                  </th>
                  <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    {t("common.copy")}
                  </th>
                  <th className="px-4 lg:px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    {t("transactions.report")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-4 lg:px-6 py-4">
                      <div className="font-semibold text-gray-900">
                        {transaction.farmer}
                      </div>
                      <div className="text-sm text-gray-500">
                        {t("common.id")}: {transaction.id}
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <code className="bg-blue-50 text-blue-800 px-2 py-1 rounded text-sm">
                        {transaction.lot}
                      </code>
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-gray-700">
                      {transaction.date}
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <span className="font-bold text-green-600">
                        ${transaction.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(transaction.status)}`}
                      >
                        {getStatusLabel(transaction.status)}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 hidden lg:table-cell">
                      <code className="text-xs text-gray-600 block truncate max-w-32">
                        {transaction.hash}
                      </code>
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(transaction.hash)}
                        className={`text-blue-600 hover:bg-blue-50 ${copiedHash === transaction.hash ? "text-green-700" : ""}`}
                      >
                        {copiedHash === transaction.hash ? (
                          <>
                            <Check className="w-4 h-4 mr-1" />
                            {t("common.copied")}
                          </>
                        ) : (
                          t("common.copy")
                        )}
                      </Button>
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReportClick(transaction)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Flag className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="p-4 border-b hover:bg-gray-50"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {transaction.farmer}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {t("common.id")}: {transaction.id}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(transaction.hash)}
                      className="p-2"
                    >
                      {copiedHash === transaction.hash ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        t("common.clipboard")
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReportClick(transaction)}
                      className="text-red-600 border-red-200 hover:bg-red-50 p-2"
                    >
                      <Flag className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500 text-xs">
                      {t("transactions.lotId")}
                    </span>
                    <div>
                      <code className="bg-blue-50 text-blue-800 px-2 py-1 rounded text-xs">
                        {transaction.lot}
                      </code>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">
                      {t("transactions.date")}
                    </span>
                    <p className="text-gray-900">{transaction.date}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">
                      {t("transactions.amount")}
                    </span>
                    <p className="font-bold text-green-600">
                      ${transaction.amount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">
                      {t("transactions.status")}
                    </span>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(transaction.status)}`}
                      >
                        {getStatusLabel(transaction.status)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="text-gray-500 text-xs">
                    {t("transactions.hash")}
                  </span>
                  <code className="block text-xs text-gray-600 mt-1 break-all">
                    {transaction.hash}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <ReportIssuePopup
        isOpen={isReportPopupOpen}
        onClose={() => setIsReportPopupOpen(false)}
        onSubmit={handleReportSubmit}
      />
    </>
  );
}
