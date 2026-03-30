"use client";

import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { cn } from '@/components/kasa/lib/utils';
import { apiFetch } from '@/components/kasa/lib/api';
import { Transaction, Category, Summary, Budget } from '@/components/kasa/types';

import { NavItem, SummaryCard, MenuButton } from '@/components/kasa/UI';
import Dashboard from '@/components/kasa/Dashboard';
import TransactionList from '@/components/kasa/TransactionList';
import AIAnalysis from '@/components/kasa/AIAnalysis';
import BudgetManager from '@/components/kasa/BudgetManager';
import AIChat from '@/components/kasa/AIChat';
import SubscriptionManager from '@/components/kasa/SubscriptionManager';
import SavingsGoals from '@/components/kasa/SavingsGoals';
import Achievements from '@/components/kasa/Achievements';
import SmartImport from '@/components/kasa/SmartImport';
import ForecastView from '@/components/kasa/ForecastView';
import InvestmentTracker from '@/components/kasa/InvestmentTracker';
import SharedWallets from '@/components/kasa/SharedWallets';
import AlertSystem from '@/components/kasa/AlertSystem';
import FinancialCalendar from '@/components/kasa/FinancialCalendar';
import VoiceInterface from '@/components/kasa/VoiceInterface';
import PortfolioInsights from '@/components/kasa/PortfolioInsights';
import DocumentSafe from '@/components/kasa/DocumentSafe';
import LegacyAccess from '@/components/kasa/LegacyAccess';
import CreditCardManager from '@/components/kasa/CreditCardManager';
import WhatIfSimulator from '@/components/kasa/WhatIfSimulator';
import { t, Lang } from '@/components/kasa/services/i18nService';
import { chatWithAI } from '@/components/kasa/services/chatService';

// Import Kasa Scoped Styles
import '@/components/kasa/kasa.css';

import {
  MessageSquare,
  RefreshCw,
  Globe,
  Trophy,
  Briefcase,
  Users,
  Calendar as CalendarIcon,
  Languages,
  Menu,
  LayoutGrid,
  X as CloseIcon,
  Mic,
  FileText,
  TrendingUp,
  ShieldCheck,
  History as HistoryIcon,
  PieChart as PieChartIcon,
  LayoutDashboard,
  Plus,
  CreditCard,
  Moon,
  Sun,
  Target,
  Sparkles,
  Zap,
  Heart,
  Scale
} from 'lucide-react';
import { useTheme } from 'next-themes';

export default function KasaPage() {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'budgets' | 'chat' | 'subscriptions' | 'goals' | 'achievements' | 'investments' | 'wallets' | 'calendar' | 'menu' | 'insights' | 'docs' | 'legacy' | 'cards' | 'settings' | 'import' | 'forecast' | 'simulate'>('dashboard');
  const [currency, setCurrency] = useState('TRY');
  const [lang, setLang] = useState<Lang>('tr');
  const [mounted, setMounted] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [summary, setSummary] = useState<Summary>({ total_income: 0, total_expense: 0 });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Apply Privacy Mode globally via CSS class on body - Adapted for Next.js wrapper
  useEffect(() => {
    if (isPrivacyMode) {
      document.body.classList.add('stealth-mode');
    } else {
      document.body.classList.remove('stealth-mode');
    }
    return () => document.body.classList.remove('stealth-mode');
  }, [isPrivacyMode]);

  // AI State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isBulkApproving, setIsBulkApproving] = useState(false);
  const [aiResults, setAiResults] = useState<any[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    category_id: '',
    type: 'expense' as 'income' | 'expense',
    tags: '',
    currency: 'TRY'
  });

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tRes, cRes, sRes, bRes] = await Promise.all([
        apiFetch('/api/kasa/transactions'),
        apiFetch('/api/kasa/categories'),
        apiFetch('/api/kasa/summary'),
        apiFetch('/api/kasa/budgets')
      ]);
      const tData = await tRes.json();
      const cData = await cRes.json();
      const sData = await sRes.json();
      const bData = await bRes.json();

      setTransactions(tData);
      setCategories(cData);
      setSummary(sData || { total_income: 0, total_expense: 0 });
      setBudgets(bData || []);
    } catch (error) {
      console.error('Kasa: Error fetching data:', error);
    }
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiFetch('/api/kasa/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          category_id: parseInt(formData.category_id)
        })
      });
      if (response.ok) {
        setIsAddModalOpen(false);
        setFormData({
          amount: '',
          description: '',
          date: format(new Date(), 'yyyy-MM-dd'),
          category_id: '',
          type: 'expense',
          tags: '',
          currency: 'TRY'
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const handleAddBudget = async (budgetData: any) => {
    try {
      await apiFetch('/api/kasa/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_id: parseInt(budgetData.category_id),
          amount: parseFloat(budgetData.amount)
        })
      });
      fetchData();
    } catch (error) {
      console.error('Error adding budget:', error);
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    try {
      await apiFetch(`/api/kasa/transactions/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const confirmAiTransaction = async (item: any) => {
    const category = categories.find(c => c.name === item.category_suggestion) || categories.find(c => c.name === 'Diğer');
    try {
      await apiFetch('/api/kasa/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: item.amount,
          description: item.description,
          date: item.date,
          category_id: category?.id,
          type: 'expense',
          is_ai_generated: true
        })
      });
      setAiResults(prev => prev.filter(i => i !== item));
      fetchData();
    } catch (error) {
      console.error('Error confirming AI transaction:', error);
    }
  };

  const handleBulkApprove = async (items?: any[], metadata?: any) => {
    const dataToApprove = items || aiResults;
    if (!dataToApprove || dataToApprove.length === 0) return false;
    
    setIsBulkApproving(true);
    try {
      const batchData = dataToApprove.map(item => {
        const category = categories.find(c => c.name === item.category_suggestion) || categories.find(c => c.name === 'Diğer');
        return {
          amount: parseFloat(item.amount.toString()),
          description: item.description,
          date: item.date,
          category_id: category?.id,
          type: item.type || 'expense',
          is_ai_generated: true
        };
      });

      const response = await apiFetch('/api/kasa/transactions/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batchData)
      });

      if (response.ok) {
        if (metadata) {
          await apiFetch('/api/kasa/statements', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: `${metadata.period} ${metadata.bank_name} ${t('statementAdded', lang)}`,
              bank_name: metadata.bank_name,
              period: metadata.period
            })
          });
        }
        setAiResults([]);
        fetchData();
        return true;
      }
    } catch (error) {
      console.error('Error bulk approving transactions:', error);
    } finally {
      setIsBulkApproving(false);
    }
    return false;
  };

  const handleVoiceInput = async (text: string) => {
    setIsVoiceOpen(false);
    try {
      const prompt = `User said: "${text}". If this is a transaction, please format it as a JSON object with: amount (number), description (string), type ("expense" or "income"), category_suggestion (string). If it's a general question, just answer.`;
      const response = await chatWithAI(prompt, transactions, summary);

      if (response.includes('{') && response.includes('}')) {
        try {
          const jsonMatch = response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);
            setFormData(prev => ({
              ...prev,
              amount: data.amount?.toString() || prev.amount,
              description: data.description || prev.description,
              type: data.type || prev.type,
              category_id: categories.find(c => c.name.toLowerCase().includes(data.category_suggestion?.toLowerCase()))?.id.toString() || prev.category_id
            }));
            setIsAddModalOpen(true);
          }
        } catch (e) {
          alert(response);
          setActiveTab('chat');
        }
      } else {
        alert(response);
        setActiveTab('chat');
      }
    } catch (error) {
      console.error("Voice processing error:", error);
    }
  };

  return (
    <div className="kasa-scope min-h-screen bg-background text-foreground transition-colors duration-500 selection:bg-primary/30 overflow-x-hidden relative">
      {/* Aurora Background Buluts */}
      <div className="aurora-bg fixed inset-0 pointer-events-none opacity-50">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen w-full">
        {/* Modern Header - Obsidian Ledger Style */}
        <header className="px-12 py-12 flex justify-between items-center w-full max-w-[1440px] mx-auto">
          <div className="flex items-center gap-16">
            <h1 className="text-2xl font-black tracking-[0.4em] text-primary leading-none">KASA</h1>
            <nav className="hidden lg:flex items-center gap-10">
              {[
                { label: t('home', lang), id: 'dashboard' },
                { label: t('budgets', lang), id: 'budgets' },
                { label: t('smartImport', lang), id: 'import' },
                { label: t('portfolio', lang), id: 'investments' },
                { label: t('history', lang), id: 'transactions' },
                { label: t('vaultTitle', lang), id: 'docs' },
                { label: t('legacy', lang), id: 'legacy' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={cn(
                    "text-[10px] font-black uppercase tracking-[0.3em] transition-all relative pb-2 group",
                    activeTab === item.id ? "text-primary" : "text-foreground/40 hover:text-foreground/80"
                  )}
                >
                  {item.label}
                  {activeTab === item.id && (
                    <motion.div layoutId="nav-line" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-6 pr-8 border-r border-white/5">
                <button
                  onClick={() => setIsPrivacyMode(!isPrivacyMode)}
                  className="text-white/20 hover:text-primary transition-colors flex items-center gap-2 group"
                  title={t('stealthMode', lang)}
                >
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all text-foreground/40">{t('privacy', lang)}</span>
                  <ShieldCheck size={20} className={isPrivacyMode ? "text-primary" : "text-foreground/20"} />
                </button>
                <button
                  onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')}
                  className="text-foreground/20 hover:text-primary transition-colors flex items-center gap-2 group"
                  title="Toggle Language"
                >
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all text-foreground/40">
                    {lang === 'tr' ? 'English' : 'Türkçe'}
                  </span>
                  <Globe size={20} className={lang === 'en' ? "text-primary" : "text-foreground/20"} />
                </button>
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="text-foreground/20 hover:text-primary transition-colors flex items-center gap-2 group"
                  title="Toggle Theme"
                >
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all text-foreground/40">
                    {mounted ? (theme === 'dark' ? t('lightMode', lang) : t('darkMode', lang)) : t('darkMode', lang)}
                  </span>
                  {mounted ? (theme === 'dark' ? <Sun size={20} className="text-primary" /> : <Moon size={20} className="text-primary" />) : <Moon size={20} className="text-primary" />}
                </button>
                <button
                   onClick={() => setIsVoiceOpen(true)}
                   className="text-white/20 hover:text-primary transition-colors"
                >
                   <Mic size={20} />
                </button>
            </div>
            <div className="flex items-center gap-4">
               <div className="text-right hidden sm:block">
                  <p className="text-[9px] font-black text-foreground/20 uppercase tracking-widest">{t('authorizedAccess', lang)}</p>
                  <p className="text-[11px] font-black text-foreground uppercase tracking-tight">Personal OS • 2026</p>
               </div>
               <div className="w-12 h-12 rounded-2xl border border-foreground/10 flex items-center justify-center text-primary bg-foreground/5 hover:bg-primary/10 transition-all cursor-pointer group">
                 <Heart size={20} className="group-hover:scale-110 transition-transform" />
               </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-[1440px] mx-auto px-12 pb-40">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <Dashboard
                key="dashboard"
                summary={summary}
                transactions={transactions}
                categories={categories}
                onTabChange={setActiveTab}
                lang={lang}
              />
            )}

            {activeTab === 'transactions' && (
              <TransactionList
                key="transactions"
                transactions={transactions}
                onDelete={handleDeleteTransaction}
                lang={lang}
              />
            )}

            {activeTab === 'import' && (
              <SmartImport
                transactions={transactions}
                onResult={(data) => {
                  setFormData(prev => ({
                    ...prev,
                    amount: data.amount?.toString() || '',
                    description: data.description || '',
                    category_id: categories.find(c => c.name.toLowerCase().includes(data.category_suggestion?.toLowerCase()))?.id.toString() || ''
                  }));
                  setIsAddModalOpen(true);
                }}
                onBulkApprove={handleBulkApprove}
                isBulkApproving={isBulkApproving}
                lang={lang}
              />
            )}

            {activeTab === 'budgets' && (
              <BudgetManager
                key="budgets"
                budgets={budgets}
                categories={categories}
                transactions={transactions}
                summary={summary}
                onAddBudget={handleAddBudget}
                onTabChange={setActiveTab}
                lang={lang}
              />
            )}

            {activeTab === 'chat' && (
              <AIChat
                key="chat"
                transactions={transactions}
                summary={summary}
                lang={lang}
              />
            )}

            {activeTab === 'investments' && (
              <InvestmentTracker
                key="investments"
                lang={lang}
              />
            )}

            {activeTab === 'docs' && (
              <DocumentSafe key="docs" lang={lang} />
            )}

            {activeTab === 'legacy' && (
              <LegacyAccess key="legacy" lang={lang} />
            )}

            {activeTab === 'cards' && (
              <CreditCardManager key="cards" lang={lang} />
            )}

            {activeTab === 'subscriptions' && (
              <SubscriptionManager key="subscriptions" categories={categories} lang={lang} />
            )}

            {activeTab === 'insights' && (
              <PortfolioInsights key="insights" lang={lang} />
            )}

            {activeTab === 'goals' && (
              <SavingsGoals key="goals" lang={lang} />
            )}

            {activeTab === 'achievements' && (
              <Achievements key="achievements" lang={lang} />
            )}

            {activeTab === 'wallets' && (
              <SharedWallets key="wallets" lang={lang} />
            )}

            {activeTab === 'calendar' && (
              <FinancialCalendar key="calendar" lang={lang} transactions={transactions} />
            )}



            {activeTab === 'forecast' && (
              <ForecastView key="forecast" lang={lang} transactions={transactions} />
            )}
            
            {activeTab === 'simulate' && (
              <WhatIfSimulator 
                key="simulate"
                currentBalance={summary.total_income - summary.total_expense}
                monthlyIncome={summary.total_income / 12} // Mocked monthly average
                monthlyExpense={summary.total_expense / 12} // Mocked monthly average
                lang={lang}
              />
            )}
            
            {activeTab === 'settings' && (
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                  <MenuButton icon={<ShieldCheck />} label={t('insights', lang)} onClick={() => setActiveTab('insights' as any)} color="bg-primary/10 text-primary border border-primary/20" />
                  <MenuButton icon={<FileText />} label={t('docs', lang)} onClick={() => setActiveTab('docs')} color="bg-foreground/5 text-foreground border border-foreground/10" />
                  <MenuButton icon={<CreditCard />} label={t('creditCardManager', lang)} onClick={() => setActiveTab('cards')} color="bg-foreground/5 text-foreground border border-foreground/10" />
                  <MenuButton icon={<RefreshCw />} label={t('subscriptions', lang)} onClick={() => setActiveTab('subscriptions' as any)} color="bg-foreground/5 text-foreground border border-foreground/10" />
                  <MenuButton icon={<Target />} label={t('goals', lang)} onClick={() => setActiveTab('goals' as any)} color="bg-foreground/5 text-foreground border border-foreground/10" />
                  <MenuButton icon={<Trophy />} label={t('achievements', lang)} onClick={() => setActiveTab('achievements' as any)} color="bg-foreground/5 text-foreground border border-foreground/10" />
                  <MenuButton icon={<Users />} label={t('wallets', lang)} onClick={() => setActiveTab('wallets' as any)} color="bg-foreground/5 text-foreground border border-foreground/10" />
                  <MenuButton icon={<CalendarIcon />} label={t('calendar', lang)} onClick={() => setActiveTab('calendar' as any)} color="bg-foreground/5 text-foreground border border-foreground/10" />
                  <MenuButton icon={<Sparkles />} label={t('forecast', lang)} onClick={() => setActiveTab('forecast' as any)} color="bg-foreground/5 text-foreground border border-foreground/10" />
                  <MenuButton icon={<Zap />} label={t('smartImport', lang)} onClick={() => setActiveTab('import' as any)} color="bg-foreground/5 text-foreground border border-foreground/10" />
                  <MenuButton icon={<Scale />} label={t('whatIfSimulator', lang)} onClick={() => setActiveTab('simulate')} color="bg-primary/10 text-primary border border-primary/20" />
               </div>
            )}
          </AnimatePresence>
        </main>

        {/* Floating Nav Pill - Obsidian Style - Center Fixed */}
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <nav className="glass py-4 px-10 flex items-center gap-6 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] dark:shadow-[0_32px_64px_-12px_rgba(0,0,0,1)] bg-card/60 backdrop-blur-3xl border border-foreground/10 rounded-full ring-1 ring-foreground/5">
            <NavItem
              active={activeTab === 'dashboard'}
              onClick={() => setActiveTab('dashboard')}
              icon={<LayoutDashboard size={22} />}
              label={t('ledger', lang)}
            />
            <NavItem
              active={activeTab === 'budgets'}
              onClick={() => setActiveTab('budgets')}
              icon={<PieChartIcon size={22} />}
              label={t('budgets', lang)}
            />
            
            <button
              onClick={() => setActiveTab('chat')}
              className={cn(
                "w-16 h-16 rounded-[2rem] flex items-center justify-center transition-all bg-primary text-black shadow-2xl shadow-primary/30 hover:scale-110 active:scale-95 group relative overflow-hidden",
                activeTab === 'chat' ? "ring-4 ring-primary/20" : ""
              )}
            >
              <Sparkles size={24} className="relative z-10 transition-transform group-hover:rotate-12" />
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-all" />
            </button>

            <NavItem
              active={activeTab === 'investments'}
              onClick={() => setActiveTab('investments')}
              icon={<Briefcase size={22} />}
              label={t('assets', lang)}
            />
            <NavItem
              active={activeTab === 'settings'}
              onClick={() => setActiveTab('settings')}
              icon={<LayoutGrid size={22} />}
              label={t('config', lang)}
            />
          </nav>
        </div>

        {/* AI Chat Button - Removed as it is now center in nav-pill */}

      </div>

      {/* New Transaction FAB - Desktop Bottom Right */}
      <button
        onClick={() => setIsAddModalOpen(true)}
        className="fixed right-12 bottom-12 w-20 h-20 rounded-[2.5rem] bg-card hover:bg-primary transition-all flex items-center justify-center group border border-foreground/10 hover:border-primary shadow-2xl z-40"
      >
        <Plus size={32} className="text-primary group-hover:text-black transition-all group-hover:rotate-90" />
      </button>

      {/* Transaction Modal & Voice Interface */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl obsidian-card !p-12 border border-white/10 shadow-[0_0_100px_-20px_rgba(255,210,31,0.1)]"
            >
              <div className="flex justify-between items-center mb-10">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2">{t('allocationProtocol', lang)}</p>
                   <h3 className="text-4xl font-black text-foreground tracking-tighter uppercase">{t('newVector', lang)}</h3>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-14 h-14 bg-foreground/5 rounded-2xl flex items-center justify-center text-foreground/20 hover:text-foreground transition-all border border-foreground/10"
                >
                  <Plus className="rotate-45" size={28} />
                </button>
              </div>

              <form onSubmit={handleAddTransaction} className="space-y-8">
                <div className="grid grid-cols-2 p-2 bg-foreground/5 rounded-2xl border border-foreground/5">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
                    className={cn(
                      "py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      formData.type === 'expense' ? "bg-primary text-black shadow-2xl shadow-primary/20" : "text-foreground/20 hover:text-foreground/40"
                    )}
                  >
                    {t('outflow', lang)}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: 'income' }))}
                    className={cn(
                      "py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      formData.type === 'income' ? "bg-primary text-black shadow-2xl shadow-primary/20" : "text-foreground/20 hover:text-foreground/40"
                    )}
                  >
                    {t('inflow', lang)}
                  </button>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.3em] px-2">{t('magnitudeLabel', lang)}</label>
                  <input
                    type="number"
                    required
                    autoFocus
                    value={formData.amount}
                    onChange={e => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                    className="w-full px-8 py-6 bg-foreground/5 border border-foreground/5 rounded-[2rem] focus:border-primary/50 outline-none transition-all text-5xl font-black placeholder:text-foreground/5 text-foreground tracking-tighter"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.3em] px-2">{t('description', lang)}</label>
                  <input
                    type="text"
                    required
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder={t('enterVectorIdentifier', lang)}
                    className="w-full px-8 py-5 bg-foreground/5 border border-foreground/5 rounded-2xl focus:border-primary/50 outline-none transition-all font-black text-sm text-foreground uppercase tracking-widest"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.3em] px-2">{t('category', lang)}</label>
                    <select
                      required
                      value={formData.category_id}
                      onChange={e => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                      className="w-full px-8 py-5 bg-foreground/5 border border-foreground/5 rounded-2xl focus:border-primary/50 outline-none transition-all font-black text-[10px] text-foreground/40 focus:text-foreground uppercase tracking-widest appearance-none"
                    >
                      <option value="">{t('select', lang)}</option>
                      {categories.filter(c => c.type === formData.type).map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.3em] px-2">{t('date', lang)}</label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-8 py-5 bg-foreground/5 border border-foreground/5 rounded-2xl focus:border-primary/50 outline-none transition-all font-black text-[10px] text-foreground/40 focus:text-foreground uppercase tracking-widest"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-6 bg-primary text-black rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all mt-4"
                >
                  {t('authorizeEntry', lang)}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isVoiceOpen && (
          <VoiceInterface
            onClose={() => setIsVoiceOpen(false)}
            onResult={handleVoiceInput}
            lang={lang}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
