'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  getWorkOrders, saveWorkOrder, createWorkOrder, 
  settleWorkOrder, revertOrderToPending, calculateLedgerMetrics, 
  generateWhatsAppBroadcast, MAATS_COTTAGE_PROFILE 
} from '../../../../lib/workOrders';

const TrackerContext = createContext(null);

export function TrackerProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Modals state
  const [selectedOrderDocs, setSelectedOrderDocs] = useState(null);
  const [activeDocTab, setActiveDocTab] = useState(0);
  const [docInspectorFullscreen, setDocInspectorFullscreen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [settleTargetOrder, setSettleTargetOrder] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const data = await getWorkOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const metrics = calculateLedgerMetrics(orders);

  const handleCopyWhatsApp = () => {
    const text = generateWhatsAppBroadcast(orders);
    navigator.clipboard.writeText(text);
    setCopiedWhatsApp(true);
    setTimeout(() => setCopiedWhatsApp(false), 2500);
  };

  const handleRevert = async (orderCode) => {
    if (typeof window !== 'undefined') {
      const confirmed = window.confirm(`Revert ${orderCode} back to Pending Approval? This will move it out of active deployments.`);
      if (!confirmed) return;
    }
    const updated = await revertOrderToPending(orderCode);
    setOrders(updated);
    setActionSuccessMsg(`Order ${orderCode} reverted back to Pending Approval.`);
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  const handleConfirmSettle = async (orderCode, settlePayload) => {
    const updated = await settleWorkOrder(orderCode, settlePayload);
    setOrders(updated);
    setSettleTargetOrder(null);
    setActionSuccessMsg(`Order ${orderCode} successfully settled and marked as Repaid!`);
    setTimeout(() => setActionSuccessMsg(''), 5000);
  };

  const handleSaveEditedOrder = async (updatedOrder) => {
    const updated = await saveWorkOrder(updatedOrder);
    setOrders(updated);
    setEditingOrder(null);
    setActionSuccessMsg(`Work Order ${updatedOrder.order_code} updated successfully!`);
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  const handleCreateOrder = async (orderForm) => {
    const code = orderForm.order_code.trim() || `MSP-0${orders.length + 1}`;
    const inv = Number(orderForm.investment_amount_bdt);
    const ret = Number(orderForm.return_amount_bdt);
    const profit = ret - inv;
    const today = new Date().toISOString().split('T')[0];
    const dueDateObj = new Date();
    dueDateObj.setDate(dueDateObj.getDate() + Number(orderForm.duration_days || 10));
    const dueDate = dueDateObj.toISOString().split('T')[0];

    const orderObj = {
      id: `wo-${Date.now()}`,
      order_code: code,
      corporate_client: orderForm.corporate_client,
      item_description: orderForm.item_description,
      investment_amount_bdt: inv,
      return_amount_bdt: ret,
      profit_bdt: profit,
      duration_days: Number(orderForm.duration_days || 10),
      start_date: today,
      due_date: dueDate,
      status: 'Pending_Approval',
      payment_mode: 'EFT/NPSB',
      bank_account_info: `${MAATS_COTTAGE_PROFILE.accountName} (A/C: ${MAATS_COTTAGE_PROFILE.accountNumber})`,
      notes: orderForm.notes || 'Submitted via Work Order Terminal',
      due_note: 'Awaiting Disbursal'
    };

    const updated = await createWorkOrder(orderObj);
    setOrders(updated);
    setShowAddModal(false);
    setActionSuccessMsg(`New order ${code} logged successfully!`);
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  const openDocs = (order, tabIndex = 0) => {
    setSelectedOrderDocs(order);
    setActiveDocTab(tabIndex);
  };

  const value = {
    orders,
    loading,
    metrics,
    copiedWhatsApp,
    actionSuccessMsg,
    handleCopyWhatsApp,
    handleRevert,
    handleConfirmSettle,
    handleSaveEditedOrder,
    handleCreateOrder,
    // Modal controls
    selectedOrderDocs,
    setSelectedOrderDocs,
    activeDocTab,
    setActiveDocTab,
    docInspectorFullscreen,
    setDocInspectorFullscreen,
    editingOrder,
    setEditingOrder,
    settleTargetOrder,
    setSettleTargetOrder,
    showAddModal,
    setShowAddModal,
    showPinModal,
    setShowPinModal,
    openDocs
  };

  return (
    <TrackerContext.Provider value={value}>
      {children}
    </TrackerContext.Provider>
  );
}

export function useTracker() {
  const ctx = useContext(TrackerContext);
  if (!ctx) {
    throw new Error('useTracker must be used within a TrackerProvider');
  }
  return ctx;
}
