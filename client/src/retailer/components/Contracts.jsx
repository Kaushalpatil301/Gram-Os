import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Plus, Trash2, CheckCircle, Clock, AlertTriangle, DollarSign } from "lucide-react"
import { farmers, contracts, filterOptions } from "../lib/data"

export default function Contracts() {
  const [contractForm, setContractForm] = useState({
    farmer: "", produce: "", quantity: "", unit: "", pricePerUnit: "", deliveryDate: ""
  })
  const [contractsData, setContractsData] = useState(contracts)
  const [livePreview, setLivePreview] = useState({})

  useEffect(() => {
    const selectedFarmer = farmers.find(f => f.name.toLowerCase().replace(/\s+/g, '') === contractForm.farmer.toLowerCase().replace(/\s+/g, ''))
    const quantity = parseFloat(contractForm.quantity) || 0
    const pricePerUnit = parseFloat(contractForm.pricePerUnit) || 0
    const totalValue = quantity * pricePerUnit

    setLivePreview({
      farmer: selectedFarmer?.name || "Select farmer...",
      farmerLocation: selectedFarmer?.location || "",
      produce: contractForm.produce || "Enter produce type...",
      quantity: contractForm.quantity && contractForm.unit ? `${contractForm.quantity} ${contractForm.unit}` : "Enter quantity...",
      pricePerUnit: contractForm.pricePerUnit ? `$${parseFloat(contractForm.pricePerUnit).toFixed(2)}` : "$0.00",
      totalValue: totalValue > 0 ? `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$0.00",
      delivery: contractForm.deliveryDate || "Select date...",
      contractId: `CNT-${String(contractsData.length + 1).padStart(3, '0')}`,
      isComplete: contractForm.farmer && contractForm.produce && contractForm.quantity && contractForm.unit && contractForm.pricePerUnit && contractForm.deliveryDate
    })
  }, [contractForm, contractsData.length])

  const handleInputChange = (field, value) => {
    setContractForm(prev => ({ ...prev, [field]: value }))
  }

  const handleCreateContract = () => {
    if (!livePreview.isComplete) return

    const selectedFarmer = farmers.find(f => f.name.toLowerCase().replace(/\s+/g, '') === contractForm.farmer.toLowerCase().replace(/\s+/g, ''))
    const totalValue = parseFloat(contractForm.quantity) * parseFloat(contractForm.pricePerUnit)

    const newContract = {
      id: `CNT-${String(contractsData.length + 1).padStart(3, '0')}`,
      farmer: selectedFarmer.name,
      farmerId: selectedFarmer.id,
      produce: contractForm.produce,
      quantity: `${contractForm.quantity} ${contractForm.unit}`,
      pricePerUnit: parseFloat(contractForm.pricePerUnit),
      totalValue: totalValue,
      status: "Pending",
      delivery: contractForm.deliveryDate,
      createdDate: new Date().toISOString().split('T'),
      blockchainHash: `0x${Math.random().toString(16).substr(2, 16)}`
    }

    setContractsData([newContract, ...contractsData])
    setContractForm({ farmer: "", produce: "", quantity: "", unit: "", pricePerUnit: "", deliveryDate: "" })
  }

  const handleDeleteContract = (contractId) => {
    if (window.confirm("Delete this contract?")) {
      setContractsData(contractsData.filter(c => c.id !== contractId))
    }
  }

  const getStatusStyle = (status) => {
    const styles = {
      "Active": "bg-green-100 text-green-800 border-green-200",
      "Pending": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "Completed": "bg-blue-100 text-blue-800 border-blue-200",
      "Expired": "bg-red-100 text-red-800 border-red-200"
    }
    return styles[status] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getStatusIcon = (status) => {
    const icons = {
      "Active": <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-600" />,
      "Pending": <Clock className="w-3 h-3 md:w-4 md:h-4 text-yellow-600" />,
      "Completed": <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />,
      "Expired": <AlertTriangle className="w-3 h-3 md:w-4 md:h-4 text-red-600" />
    }
    return icons[status] || null
  }

  return (
    <section id="contracts" className="bg-white rounded-3xl shadow-xl overflow-hidden mb-12 border border-green-100">
      <div className="p-6 md:p-10">

        {/* Header */}
        <div className="mb-6 md:mb-10 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-3">Smart Contracts</h2>
          <p className="text-sm md:text-base text-gray-600">Create and manage blockchain-based agreements</p>
        </div>

        {/* Form & Preview Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-10">

          {/* Contract Form */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3 md:pb-4 px-4 md:px-6">
              <CardTitle className="flex items-center space-x-2 text-base md:text-lg">
                <Plus className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                <span>Create New Contract</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6 px-4 md:px-6">

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 md:mb-3">Farmer *</label>
                <Select onValueChange={(value) => handleInputChange('farmer', value)} value={contractForm.farmer}>
                  <SelectTrigger className="h-10 md:h-12 border-gray-200">
                    <SelectValue placeholder="Choose a farmer" />
                  </SelectTrigger>
                  <SelectContent>
                    {farmers.map((farmer) => (
                      <SelectItem key={farmer.id} value={farmer.name.toLowerCase().replace(/\s+/g, '')}>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
                          <span>{farmer.name}</span>
                          <span className="text-sm text-gray-500 sm:ml-2">{farmer.produce}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 md:mb-3">Produce Type *</label>
                <Input
                  placeholder="e.g., Organic Tomatoes"
                  className="h-10 md:h-12 border-gray-200"
                  value={contractForm.produce}
                  onChange={(e) => handleInputChange('produce', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 md:mb-3">Quantity *</label>
                  <Input
                    placeholder="1000"
                    type="number"
                    className="h-10 md:h-12 border-gray-200"
                    value={contractForm.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 md:mb-3">Unit *</label>
                  <Select onValueChange={(value) => handleInputChange('unit', value)} value={contractForm.unit}>
                    <SelectTrigger className="h-10 md:h-12 border-gray-200">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {filterOptions.units.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>{unit.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 md:mb-3">Price per Unit ($) *</label>
                <Input
                  placeholder="2.50"
                  type="number"
                  step="0.01"
                  className="h-10 md:h-12 border-gray-200"
                  value={contractForm.pricePerUnit}
                  onChange={(e) => handleInputChange('pricePerUnit', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 md:mb-3">Delivery Date *</label>
                <Input
                  type="date"
                  className="h-10 md:h-12 border-gray-200"
                  value={contractForm.deliveryDate}
                  onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                  min={new Date().toISOString().split('T')}
                />
              </div>

              <Button
                className="w-full h-10 md:h-12"
                onClick={handleCreateContract}
                disabled={!livePreview.isComplete}
              >
                Create Contract
              </Button>
            </CardContent>
          </Card>

          {/* Live Preview */}
          <Card className={`border-0 shadow-sm ${livePreview.isComplete ? 'ring-2 ring-green-100' : ''}`}>
            <CardHeader className="pb-3 md:pb-4 px-4 md:px-6">
              <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-base md:text-lg">
                <span>Contract Preview</span>
                {livePreview.isComplete && (
                  <Badge className="bg-green-100 text-green-800 mt-2 sm:mt-0">Ready</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 md:px-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 md:p-6 space-y-4 md:space-y-6">
                <div className="text-center pb-3 md:pb-4 border-b border-blue-100">
                  <h3 className="text-base md:text-lg font-bold text-gray-900">Smart Contract Agreement</h3>
                  <p className="text-xs md:text-sm text-blue-600 mt-1">Contract ID: {livePreview.contractId}</p>
                </div>

                <div className="space-y-3 md:space-y-4">
                  {[
                    { label: 'Farmer', value: livePreview.farmer, location: livePreview.farmerLocation },
                    { label: 'Produce', value: livePreview.produce },
                    { label: 'Quantity', value: livePreview.quantity },
                    { label: 'Price per Unit', value: livePreview.pricePerUnit },
                    { label: 'Delivery Date', value: livePreview.delivery }
                  ].map(({ label, value, location }) => (
                    <div key={label} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2">
                      <span className="text-gray-600 font-medium text-sm md:text-base">{label}:</span>
                      <div className="text-left sm:text-right mt-1 sm:mt-0">
                        <div className="font-semibold text-gray-900 text-sm md:text-base">{value}</div>
                        {location && <div className="text-xs text-gray-500">{location}</div>}
                      </div>
                    </div>
                  ))}

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 bg-green-50 px-3 rounded-lg">
                    <span className="text-gray-600 font-medium flex items-center text-sm md:text-base">
                      <DollarSign className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                      Total Value:
                    </span>
                    <span className="font-bold text-green-700 text-base md:text-lg mt-1 sm:mt-0">{livePreview.totalValue}</span>
                  </div>
                </div>

                <div className="border-t border-blue-100 pt-3 md:pt-4">
                  <p className="text-xs md:text-sm text-gray-500 text-center">
                    {livePreview.isComplete ? "✅ Ready for blockchain" : "⚠️ Complete all fields"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contracts Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="px-4 md:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <CardTitle>Active Contracts ({contractsData.length})</CardTitle>
              <div className="text-xs md:text-sm text-gray-600 bg-gray-50 px-2 md:px-3 py-1 rounded-full">
                Total: ${contractsData.reduce((sum, c) => sum + (c.totalValue || 0), 0).toLocaleString()}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-gray-900">ID</th>
                    <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-gray-900">Farmer</th>
                    <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-gray-900">Produce</th>
                    <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-gray-900 hidden lg:table-cell">Quantity</th>
                    <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-gray-900">Value</th>
                    <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-gray-900 hidden lg:table-cell">Delivery</th>
                    <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {contractsData.map((contract) => (
                    <tr key={contract.id} className="hover:bg-gray-50">
                      <td className="px-4 lg:px-6 py-4">
                        <code className="text-xs lg:text-sm text-gray-800">{contract.id}</code>
                      </td>
                      <td className="px-4 lg:px-6 py-4 font-medium text-gray-900">{contract.farmer}</td>
                      <td className="px-4 lg:px-6 py-4 text-gray-700">{contract.produce}</td>
                      <td className="px-4 lg:px-6 py-4 text-gray-700 hidden lg:table-cell">{contract.quantity}</td>
                      <td className="px-4 lg:px-6 py-4">
                        <span className="font-bold text-green-600">${contract.totalValue?.toLocaleString()}</span>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <div className="flex items-center space-x-1 md:space-x-2">
                          {getStatusIcon(contract.status)}
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(contract.status)}`}>
                            {contract.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-gray-700 hidden lg:table-cell">{contract.delivery}</td>
                      <td className="px-4 lg:px-6 py-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteContract(contract.id)}
                          className="text-red-600 hover:bg-red-50 p-1 md:p-2"
                        >
                          <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden">
              {contractsData.map((contract) => (
                <div key={contract.id} className="p-4 border-b hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{contract.farmer}</h3>
                      <code className="text-xs text-gray-500">{contract.id}</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(contract.status)}
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(contract.status)}`}>
                          {contract.status}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteContract(contract.id)}
                        className="text-red-600 hover:bg-red-50 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500 text-xs">Produce</span>
                      <p className="text-gray-900">{contract.produce}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs">Quantity</span>
                      <p className="text-gray-900">{contract.quantity}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs">Value</span>
                      <p className="font-bold text-green-600">${contract.totalValue?.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs">Delivery</span>
                      <p className="text-gray-900">{contract.delivery}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
