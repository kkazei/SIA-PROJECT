import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { useMaintenanceStore } from "../store/maintenanceStore";
import { usePaymentStore } from "../store/paymentStore";

const ApartmentAnalytics = ({ apartment }) => {
    const [analyticsData, setAnalyticsData] = useState({
        totalIncome: 0,
        totalExpenses: 0,
        monthlyIncome: Array(12).fill(0),
        monthlyExpenses: Array(12).fill(0),
    });
    const [maintenanceHistory, setMaintenanceHistory] = useState([]);
    const [paymentHistory, setPaymentHistory] = useState([]);
    const { maintenanceRequests } = useMaintenanceStore();
    const { payments } = usePaymentStore();

    useEffect(() => {
        if (!apartment || !apartment._id) return;
        
        // Filter maintenance requests for this apartment
        const apartmentMaintenance = maintenanceRequests.filter(
            task => task.apartment_id?._id === apartment._id || task.apartment_id === apartment._id
        );
        
        // Filter payments for this apartment
        const apartmentPayments = payments.filter(
            payment => payment.apartment_id === apartment._id
        );
        
        // Set maintenance history
        setMaintenanceHistory(apartmentMaintenance);
        
        // Set payment history
        setPaymentHistory(apartmentPayments);
        
        // Calculate analytics
        const monthlyIncome = Array(12).fill(0);
        const monthlyExpenses = Array(12).fill(0);
        let totalIncome = 0;
        let totalExpenses = 0;
        
        // Process payment data
        apartmentPayments.forEach(payment => {
            if (payment.status === 'approved') {
                const paymentDate = new Date(payment.createdAt || payment.paymentDate);
                const month = paymentDate.getMonth();
                const amount = Number(payment.amount || 0);
                
                monthlyIncome[month] += amount;
                totalIncome += amount;
            }
        });
        
        // Process maintenance data
        apartmentMaintenance.forEach(task => {
            if (task.status === 'completed') {
                const taskDate = new Date(task.createdAt || task.start_date);
                const month = taskDate.getMonth();
                const expenses = Number(task.expenses || 0);
                
                monthlyExpenses[month] += expenses;
                totalExpenses += expenses;
            }
        });
        
        setAnalyticsData({
            totalIncome,
            totalExpenses,
            monthlyIncome,
            monthlyExpenses,
        });
        
    }, [apartment, maintenanceRequests, payments]);

    // Chart configuration
    const chartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: 'Income',
                data: analyticsData.monthlyIncome,
                backgroundColor: 'rgba(34, 197, 94, 0.8)',
                borderRadius: 5,
            },
            {
                label: 'Expenses',
                data: analyticsData.monthlyExpenses,
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
                borderRadius: 5,
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                grid: { display: true, color: 'rgba(255, 255, 255, 0.1)' },
                ticks: { color: '#fff' }
            },
            y: {
                beginAtZero: true,
                grid: { display: true, color: 'rgba(255, 255, 255, 0.1)' },
                ticks: { color: '#fff' }
            }
        },
        plugins: {
            legend: {
                labels: { color: '#fff' }
            },
            tooltip: { enabled: true }
        }
    };

    const profitLoss = analyticsData.totalIncome - analyticsData.totalExpenses;
    const profitMargin = analyticsData.totalIncome > 0 
        ? ((profitLoss / analyticsData.totalIncome) * 100).toFixed(2) 
        : 0;

    return (
        <div className="bg-gray-800 rounded-lg p-4 mt-4">
            <h3 className="text-lg font-bold text-white mb-4">Room Financial Analytics</h3>

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="bg-gray-700 p-3 rounded-lg">
                    <p className="text-gray-400 text-xs">Total Income</p>
                    <p className="text-green-400 text-lg font-bold">₱{analyticsData.totalIncome.toLocaleString()}</p>
                </div>
                <div className="bg-gray-700 p-3 rounded-lg">
                    <p className="text-gray-400 text-xs">Total Expenses</p>
                    <p className="text-red-400 text-lg font-bold">₱{analyticsData.totalExpenses.toLocaleString()}</p>
                </div>
                <div className="bg-gray-700 p-3 rounded-lg">
                    <p className="text-gray-400 text-xs">Net Profit/Loss</p>
                    <p className={`text-lg font-bold ${profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ₱{profitLoss.toLocaleString()}
                    </p>
                </div>
                <div className="bg-gray-700 p-3 rounded-lg">
                    <p className="text-gray-400 text-xs">Profit Margin</p>
                    <p className={`text-lg font-bold ${profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {profitMargin}%
                    </p>
                </div>
            </div>

            {/* Chart */}
            <div className="bg-gray-700 p-4 rounded-lg mb-6">
                <h4 className="text-white text-sm mb-3">Monthly Income and Expenses</h4>
                <div className="h-64">
                    <Bar data={chartData} options={chartOptions} />
                </div>
            </div>

            {/* Transaction History */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Maintenance History */}
                <div className="bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-white text-sm mb-2">Maintenance History</h4>
                    {maintenanceHistory.length > 0 ? (
                        <div className="max-h-48 overflow-y-auto">
                            {maintenanceHistory.map(task => (
                                <div key={task._id} className="flex justify-between items-center border-b border-gray-600 py-2">
                                    <div>
                                        <p className="text-white text-xs">{task.description}</p>
                                        <p className="text-gray-400 text-xs">
                                            {new Date(task.start_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-red-400 text-xs font-semibold">₱{Number(task.expenses).toLocaleString()}</p>
                                        <p className={`text-xs font-medium ${
                                            task.status === 'completed' ? 'text-green-400' : 
                                            task.status === 'ongoing' ? 'text-blue-400' : 'text-yellow-400'
                                        }`}>
                                            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-xs">No maintenance history found.</p>
                    )}
                </div>

                {/* Payment History */}
                <div className="bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-white text-sm mb-2">Payment History</h4>
                    {paymentHistory.length > 0 ? (
                        <div className="max-h-48 overflow-y-auto">
                            {paymentHistory.map(payment => (
                                <div key={payment._id} className="flex justify-between items-center border-b border-gray-600 py-2">
                                    <div>
                                        <p className="text-white text-xs">
                                            {payment.tenant_name || payment.reference_number || 'Payment'}
                                        </p>
                                        <p className="text-gray-400 text-xs">
                                            {new Date(payment.createdAt || payment.paymentDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-green-400 text-xs font-semibold">₱{Number(payment.amount).toLocaleString()}</p>
                                        <p className={`text-xs font-medium ${
                                            payment.status === 'approved' ? 'text-green-400' : 
                                            payment.status === 'rejected' ? 'text-red-400' : 'text-yellow-400'
                                        }`}>
                                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-xs">No payment history found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ApartmentAnalytics;