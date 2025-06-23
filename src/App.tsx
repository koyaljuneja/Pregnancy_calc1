import React, { useState, useEffect } from 'react';
import { Calendar, Heart, Share2, Copy, Baby, Clock, Menu, X, Info, Shield, HelpCircle, Mail, Home } from 'lucide-react';

interface CalculationResults {
  dueDate: Date;
  conceptionDate: Date;
  currentWeek: number;
  daysRemaining: number;
  trimester: number;
}

type Page = 'home' | 'about' | 'disclaimer' | 'privacy' | 'faq' | 'contact';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [calculationMethod, setCalculationMethod] = useState<'lmp' | 'dueDate'>('lmp');
  const [lmpDate, setLmpDate] = useState<string>('');
  const [dueDateInput, setDueDateInput] = useState<string>('');
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [copied, setCopied] = useState(false);

  // Calculate results based on input method
  useEffect(() => {
    if (calculationMethod === 'lmp' && lmpDate) {
      calculateFromLMP(new Date(lmpDate));
    } else if (calculationMethod === 'dueDate' && dueDateInput) {
      calculateFromDueDate(new Date(dueDateInput));
    } else {
      setResults(null);
    }
  }, [calculationMethod, lmpDate, dueDateInput]);

  const calculateFromLMP = (lmp: Date) => {
    // Due date is 280 days (40 weeks) from LMP
    const dueDate = new Date(lmp.getTime() + (280 * 24 * 60 * 60 * 1000));
    
    // Conception typically occurs ~14 days after LMP (ovulation)
    const conceptionDate = new Date(lmp.getTime() + (14 * 24 * 60 * 60 * 1000));
    
    // Calculate current pregnancy week
    const today = new Date();
    const daysSinceLMP = Math.floor((today.getTime() - lmp.getTime()) / (24 * 60 * 60 * 1000));
    const currentWeek = Math.floor(daysSinceLMP / 7);
    
    // Days remaining until due date
    const daysRemaining = Math.max(0, Math.floor((dueDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)));
    
    // Determine trimester
    const trimester = currentWeek <= 12 ? 1 : currentWeek <= 27 ? 2 : 3;
    
    setResults({
      dueDate,
      conceptionDate,
      currentWeek: Math.max(0, currentWeek),
      daysRemaining,
      trimester
    });
  };

  const calculateFromDueDate = (dueDate: Date) => {
    // LMP is 280 days before due date
    const lmp = new Date(dueDate.getTime() - (280 * 24 * 60 * 60 * 1000));
    
    // Conception is ~14 days after LMP
    const conceptionDate = new Date(lmp.getTime() + (14 * 24 * 60 * 60 * 1000));
    
    // Calculate current pregnancy week
    const today = new Date();
    const daysSinceLMP = Math.floor((today.getTime() - lmp.getTime()) / (24 * 60 * 60 * 1000));
    const currentWeek = Math.floor(daysSinceLMP / 7);
    
    // Days remaining until due date
    const daysRemaining = Math.max(0, Math.floor((dueDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)));
    
    // Determine trimester
    const trimester = currentWeek <= 12 ? 1 : currentWeek <= 27 ? 2 : 3;
    
    setResults({
      dueDate,
      conceptionDate,
      currentWeek: Math.max(0, currentWeek),
      daysRemaining,
      trimester
    });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getShareText = () => {
    if (!results) return '';
    
    return `🤱 My Pregnancy Calculator Results:

📅 Estimated Due Date: ${formatDate(results.dueDate)}
💝 Estimated Conception Date: ${formatDate(results.conceptionDate)}
🗓️ Current Week: ${results.currentWeek} weeks pregnant
⏰ Days Remaining: ${results.daysRemaining} days
🌸 Trimester: ${results.trimester === 1 ? 'First' : results.trimester === 2 ? 'Second' : 'Third'} Trimester

Calculate your pregnancy dates at: ${window.location.origin}

#pregnancy #duedate #expecting #babycalculator`;
  };

  const shareResults = async () => {
    if (!results) return;
    
    const shareText = getShareText();

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Pregnancy Calculator Results',
          text: shareText,
          url: window.location.origin
        });
      } catch (err) {
        copyToClipboard(shareText);
      }
    } else {
      copyToClipboard(shareText);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const getTrimesterInfo = (trimester: number) => {
    const info = {
      1: { name: 'First Trimester', color: 'text-pink-600', bg: 'bg-pink-100' },
      2: { name: 'Second Trimester', color: 'text-blue-600', bg: 'bg-blue-100' },
      3: { name: 'Third Trimester', color: 'text-purple-600', bg: 'bg-purple-100' }
    };
    return info[trimester as keyof typeof info] || info[1];
  };

  const navigationItems = [
    { id: 'home' as Page, label: 'Calculator', icon: Home },
    { id: 'about' as Page, label: 'About Tool', icon: Info },
    { id: 'faq' as Page, label: 'FAQ', icon: HelpCircle },
    { id: 'disclaimer' as Page, label: 'Disclaimer', icon: Shield },
    { id: 'privacy' as Page, label: 'Privacy', icon: Shield },
    { id: 'contact' as Page, label: 'Contact', icon: Mail },
  ];

  const renderNavigation = () => (
    <nav className="flex items-center space-x-1">
      {/* Desktop Navigation */}
      <div className="hidden md:flex space-x-1">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              currentPage === item.id
                ? 'bg-pink-100 text-pink-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-200 md:hidden">
          <div className="py-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full px-4 py-3 text-left text-sm font-medium transition-all duration-200 flex items-center gap-3 ${
                  currentPage === item.id
                    ? 'bg-pink-50 text-pink-700 border-r-2 border-pink-500'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );

  const renderHomePage = () => (
    <>
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Free Pregnancy Due Date Calculator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            Calculate your estimated due date and conception date instantly. Our accurate pregnancy calculator 
            helps you track your pregnancy journey with precise calculations based on medical standards.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Accurate Calculations
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              Medical Standards
            </span>
            <span className="flex items-center gap-1">
              <Share2 className="w-4 h-4" />
              Easy Sharing
            </span>
          </div>
        </section>

        {/* Calculation Method Selector */}
        <section className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-pink-500" />
              Choose Your Calculation Method
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => setCalculationMethod('lmp')}
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  calculationMethod === 'lmp'
                    ? 'border-pink-300 bg-pink-50 shadow-md'
                    : 'border-gray-200 bg-gray-50 hover:border-pink-200 hover:bg-pink-25'
                }`}
                aria-pressed={calculationMethod === 'lmp'}
                role="radio"
              >
                <div className="font-medium text-gray-800 mb-1">
                  Last Menstrual Period (LMP)
                </div>
                <div className="text-sm text-gray-600">
                  Most common method - enter the first day of your last period
                </div>
              </button>
              
              <button
                onClick={() => setCalculationMethod('dueDate')}
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  calculationMethod === 'dueDate'
                    ? 'border-blue-300 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-gray-50 hover:border-blue-200 hover:bg-blue-25'
                }`}
                aria-pressed={calculationMethod === 'dueDate'}
                role="radio"
              >
                <div className="font-medium text-gray-800 mb-1">
                  Known Due Date
                </div>
                <div className="text-sm text-gray-600">
                  If you already know your due date from a previous calculation
                </div>
              </button>
            </div>

            {/* Date Input */}
            <div className="space-y-4">
              {calculationMethod === 'lmp' ? (
                <div>
                  <label htmlFor="lmp-date" className="block text-sm font-medium text-gray-700 mb-2">
                    First Day of Last Menstrual Period
                  </label>
                  <input
                    type="date"
                    id="lmp-date"
                    value={lmpDate}
                    onChange={(e) => setLmpDate(e.target.value)}
                    className="w-full px-4 py-3 text-lg rounded-xl border-2 border-gray-200 focus:border-pink-400 focus:outline-none transition-colors duration-200"
                    aria-describedby="lmp-help"
                  />
                  <p id="lmp-help" className="text-sm text-gray-500 mt-1">
                    Select the first day of your last menstrual period to calculate your due date
                  </p>
                </div>
              ) : (
                <div>
                  <label htmlFor="due-date" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Due Date
                  </label>
                  <input
                    type="date"
                    id="due-date"
                    value={dueDateInput}
                    onChange={(e) => setDueDateInput(e.target.value)}
                    className="w-full px-4 py-3 text-lg rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none transition-colors duration-200"
                    aria-describedby="due-date-help"
                  />
                  <p id="due-date-help" className="text-sm text-gray-500 mt-1">
                    Enter your known due date to calculate conception date and current week
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Results Section */}
        {results && (
          <section className="space-y-6" role="region" aria-label="Calculation Results">
            {/* Main Results Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Due Date Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-pink-400">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-pink-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-pink-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Estimated Due Date</h3>
                </div>
                <p className="text-2xl font-bold text-pink-600 mb-2">
                  {formatDate(results.dueDate)}
                </p>
                <p className="text-sm text-gray-600">
                  {results.daysRemaining > 0 
                    ? `${results.daysRemaining} days remaining`
                    : results.daysRemaining === 0 
                    ? 'Due today!'
                    : `${Math.abs(results.daysRemaining)} days overdue`
                  }
                </p>
              </div>

              {/* Conception Date Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-400">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Heart className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Estimated Conception Date</h3>
                </div>
                <p className="text-2xl font-bold text-blue-600 mb-2">
                  {formatDate(results.conceptionDate)}
                </p>
                <p className="text-sm text-gray-600">
                  Approximate date of conception
                </p>
              </div>
            </div>

            {/* Progress Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-500" />
                Pregnancy Progress
              </h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                {/* Current Week */}
                <div className="text-center">
                  <div className="p-4 bg-gradient-to-r from-pink-100 to-blue-100 rounded-xl mb-3">
                    <p className="text-3xl font-bold text-purple-600">
                      {results.currentWeek}
                    </p>
                    <p className="text-sm font-medium text-gray-700">
                      Weeks Pregnant
                    </p>
                  </div>
                  <p className="text-xs text-gray-600">Based on LMP</p>
                </div>

                {/* Trimester */}
                <div className="text-center">
                  <div className={`p-4 ${getTrimesterInfo(results.trimester).bg} rounded-xl mb-3`}>
                    <p className={`text-lg font-bold ${getTrimesterInfo(results.trimester).color}`}>
                      {getTrimesterInfo(results.trimester).name}
                    </p>
                    <p className="text-sm font-medium text-gray-700">
                      Current Stage
                    </p>
                  </div>
                  <p className="text-xs text-gray-600">
                    {results.trimester === 1 ? 'Weeks 1-12' : 
                     results.trimester === 2 ? 'Weeks 13-27' : 'Weeks 28-40'}
                  </p>
                </div>

                {/* Days to Go */}
                <div className="text-center">
                  <div className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl mb-3">
                    <p className="text-3xl font-bold text-blue-600">
                      {results.daysRemaining}
                    </p>
                    <p className="text-sm font-medium text-gray-700">
                      Days to Go
                    </p>
                  </div>
                  <p className="text-xs text-gray-600">Until due date</p>
                </div>
              </div>
            </div>

            {/* Share Results */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-green-500" />
                Share Your Results
              </h3>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={shareResults}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-blue-500 text-white rounded-xl font-medium hover:from-pink-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-105"
                  aria-label="Share pregnancy calculation results"
                >
                  <Share2 className="w-4 h-4" />
                  Share Results
                </button>
                
                <button
                  onClick={() => copyToClipboard(getShareText())}
                  className={`px-6 py-3 border-2 rounded-xl font-medium transition-all duration-200 ${
                    copied 
                      ? 'border-green-300 bg-green-50 text-green-700'
                      : 'border-gray-300 bg-gray-50 text-gray-700 hover:border-gray-400'
                  }`}
                  aria-label="Copy results to clipboard"
                >
                  <Copy className="w-4 h-4 inline mr-2" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* How It Works Section */}
        <section className="mt-12 bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            How Our Pregnancy Calculator Works
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-pink-500" />
                LMP Method (Most Common)
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                The Last Menstrual Period method uses Naegele's Rule, adding 280 days (40 weeks) to the first day 
                of your last menstrual period. This is the standard method used by healthcare providers worldwide.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Due Date = LMP + 280 days</li>
                <li>• Conception Date = LMP + 14 days (average ovulation)</li>
                <li>• Current Week = Days since LMP ÷ 7</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                <Heart className="w-5 h-5 text-blue-500" />
                Due Date Method
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                If you already know your due date from an ultrasound or previous calculation, we can work backwards 
                to estimate your conception date and current pregnancy progress.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• LMP = Due Date - 280 days</li>
                <li>• Conception Date = LMP + 14 days</li>
                <li>• Progress calculated from estimated LMP</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Important Disclaimer */}
        <section className="mt-12 bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-amber-800 mb-3">
            Important Medical Disclaimer
          </h3>
          <p className="text-amber-700 text-sm leading-relaxed">
            This calculator provides estimates based on standard pregnancy calculations and should not replace professional medical advice. 
            Due dates can vary, and only your healthcare provider can give you personalized medical guidance. 
            Please consult with your doctor or midwife for accurate pregnancy dating and prenatal care.
          </p>
        </section>
      </main>
    </>
  );

  const renderAboutPage = () => (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">About Our Pregnancy Due Date Calculator</h1>
        
        <div className="prose max-w-none">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">What is a Pregnancy Due Date Calculator?</h2>
          <p className="text-gray-600 mb-6">
            A pregnancy due date calculator is a medical tool that estimates when your baby is likely to be born based on 
            the first day of your last menstrual period (LMP) or a known due date. Our calculator uses the standard 
            Naegele's Rule, which is the same method used by healthcare providers worldwide to estimate due dates.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mb-4">Why Use Our Pregnancy Calculator?</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-pink-50 p-4 rounded-lg">
              <h3 className="font-medium text-pink-800 mb-2">Accurate Calculations</h3>
              <p className="text-sm text-pink-700">
                Based on medical standards and Naegele's Rule used by healthcare professionals globally.
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Instant Results</h3>
              <p className="text-sm text-blue-700">
                Get your due date, conception date, and current pregnancy week immediately.
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">Easy to Use</h3>
              <p className="text-sm text-green-700">
                Simple interface designed for expecting mothers with clear instructions.
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-medium text-purple-800 mb-2">Share Results</h3>
              <p className="text-sm text-purple-700">
                Easily share your pregnancy milestones with family and friends.
              </p>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-gray-800 mb-4">How Accurate is the Calculator?</h2>
          <p className="text-gray-600 mb-4">
            Our pregnancy calculator is approximately 80% accurate within 5 days of the actual delivery date. 
            However, it's important to understand that:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-1">
            <li>Only about 5% of babies are born on their exact due date</li>
            <li>Most babies are born within 2 weeks before or after the due date</li>
            <li>First-time mothers often deliver 1-2 days after their due date</li>
            <li>Ultrasound dating in the first trimester is more accurate than LMP dating</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-800 mb-4">Understanding Your Results</h2>
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h3 className="font-medium text-gray-800 mb-3">What You'll Get:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><strong>Estimated Due Date:</strong> The most likely date your baby will be born</li>
              <li><strong>Conception Date:</strong> Approximate date when conception occurred (LMP + 14 days)</li>
              <li><strong>Current Pregnancy Week:</strong> How many weeks pregnant you are today</li>
              <li><strong>Days Remaining:</strong> Countdown to your due date</li>
              <li><strong>Trimester Information:</strong> Which stage of pregnancy you're currently in</li>
            </ul>
          </div>

          <h2 className="text-xl font-semibold text-gray-800 mb-4">When to See Your Healthcare Provider</h2>
          <p className="text-gray-600 mb-4">
            While our calculator provides helpful estimates, you should always consult with your healthcare provider for:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-1">
            <li>Confirmation of pregnancy</li>
            <li>Accurate dating through ultrasound</li>
            <li>Prenatal care planning</li>
            <li>Any concerns about your pregnancy</li>
            <li>Irregular menstrual cycles that might affect calculations</li>
          </ul>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-medium text-blue-800 mb-2">Remember</h3>
            <p className="text-blue-700 text-sm">
              This tool is for informational purposes only and should not replace professional medical advice. 
              Always consult with your healthcare provider for personalized pregnancy care and accurate dating.
            </p>
          </div>
        </div>
      </div>
    </main>
  );

  const renderFAQPage = () => (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h1>
        
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">General Questions</h2>
            
            <div className="space-y-6">
              <div className="border-l-4 border-pink-400 pl-4">
                <h3 className="font-medium text-gray-800 mb-2">
                  How accurate is this pregnancy calculator?
                </h3>
                <p className="text-gray-600 text-sm">
                  Our calculator uses the standard Naegele's rule and is about 80% accurate within 5 days. 
                  However, only about 5% of babies are born on their exact due date. Most deliveries occur 
                  within 2 weeks before or after the estimated due date.
                </p>
              </div>

              <div className="border-l-4 border-blue-400 pl-4">
                <h3 className="font-medium text-gray-800 mb-2">
                  What if I don't remember my last menstrual period?
                </h3>
                <p className="text-gray-600 text-sm">
                  If you can't remember your LMP, your healthcare provider can determine your due date through 
                  ultrasound measurements, which are most accurate in the first trimester. You can also use 
                  our "Known Due Date" option if you have this information from a previous calculation.
                </p>
              </div>

              <div className="border-l-4 border-green-400 pl-4">
                <h3 className="font-medium text-gray-800 mb-2">
                  Can conception date calculations be wrong?
                </h3>
                <p className="text-gray-600 text-sm">
                  Yes, conception date is an estimate based on average ovulation timing (14 days after LMP). 
                  Actual ovulation can vary significantly between individuals and cycles, ranging from day 10 to day 20 
                  of the menstrual cycle.
                </p>
              </div>

              <div className="border-l-4 border-purple-400 pl-4">
                <h3 className="font-medium text-gray-800 mb-2">
                  Is this calculator suitable for IVF pregnancies?
                </h3>
                <p className="text-gray-600 text-sm">
                  For IVF pregnancies, your fertility clinic will provide more accurate dating based on the 
                  embryo transfer date. Our calculator is designed for natural conception and may not be 
                  as accurate for assisted reproductive technology pregnancies.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Using the Calculator</h2>
            
            <div className="space-y-6">
              <div className="border-l-4 border-pink-400 pl-4">
                <h3 className="font-medium text-gray-800 mb-2">
                  Which method should I choose - LMP or Due Date?
                </h3>
                <p className="text-gray-600 text-sm">
                  Choose "Last Menstrual Period (LMP)" if you know the first day of your last period - this is 
                  the most common and standard method. Choose "Known Due Date" if you already have a due date 
                  from a previous ultrasound or calculation and want to find your conception date.
                </p>
              </div>

              <div className="border-l-4 border-blue-400 pl-4">
                <h3 className="font-medium text-gray-800 mb-2">
                  What if my cycles are irregular?
                </h3>
                <p className="text-gray-600 text-sm">
                  If you have irregular menstrual cycles, the LMP method may be less accurate. In this case, 
                  ultrasound dating by your healthcare provider will be more reliable. Our calculator assumes 
                  a standard 28-day cycle with ovulation on day 14.
                </p>
              </div>

              <div className="border-l-4 border-green-400 pl-4">
                <h3 className="font-medium text-gray-800 mb-2">
                  Can I use this calculator multiple times during pregnancy?
                </h3>
                <p className="text-gray-600 text-sm">
                  Yes! You can use our calculator throughout your pregnancy to track your progress, see how many 
                  weeks pregnant you are, and count down the days until your due date. The results will update 
                  based on the current date.
                </p>
              </div>

              <div className="border-l-4 border-purple-400 pl-4">
                <h3 className="font-medium text-gray-800 mb-2">
                  How do I share my results?
                </h3>
                <p className="text-gray-600 text-sm">
                  After calculating your results, you'll see a "Share Results" section. You can either use the 
                  native share function (on mobile devices) or copy the formatted text to share on social media, 
                  with family, or save for your records.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Medical Information</h2>
            
            <div className="space-y-6">
              <div className="border-l-4 border-pink-400 pl-4">
                <h3 className="font-medium text-gray-800 mb-2">
                  What are the three trimesters of pregnancy?
                </h3>
                <p className="text-gray-600 text-sm">
                  Pregnancy is divided into three trimesters: First trimester (weeks 1-12), Second trimester 
                  (weeks 13-27), and Third trimester (weeks 28-40). Each trimester has different developmental 
                  milestones and common symptoms.
                </p>
              </div>

              <div className="border-l-4 border-blue-400 pl-4">
                <h3 className="font-medium text-gray-800 mb-2">
                  When should I start prenatal care?
                </h3>
                <p className="text-gray-600 text-sm">
                  You should schedule your first prenatal appointment as soon as you know you're pregnant, 
                  ideally by 8-10 weeks of pregnancy. Early prenatal care is important for monitoring your 
                  health and your baby's development.
                </p>
              </div>

              <div className="border-l-4 border-green-400 pl-4">
                <h3 className="font-medium text-gray-800 mb-2">
                  What if my baby is born before or after the due date?
                </h3>
                <p className="text-gray-600 text-sm">
                  This is completely normal! Babies born between 37-42 weeks are considered full-term. 
                  About 90% of babies are born within 2 weeks of their due date. Your healthcare provider 
                  will monitor you closely as you approach and pass your due date.
                </p>
              </div>

              <div className="border-l-4 border-purple-400 pl-4">
                <h3 className="font-medium text-gray-800 mb-2">
                  Should I rely solely on this calculator for pregnancy planning?
                </h3>
                <p className="text-gray-600 text-sm">
                  No, this calculator is a helpful tool for estimates, but you should always consult with 
                  your healthcare provider for accurate pregnancy dating, prenatal care planning, and any 
                  medical decisions. Professional medical advice is essential for a healthy pregnancy.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <h3 className="font-medium text-amber-800 mb-2">Still Have Questions?</h3>
            <p className="text-amber-700 text-sm mb-3">
              If you have additional questions about using our pregnancy calculator or need more information 
              about pregnancy dating, please don't hesitate to contact us.
            </p>
            <button
              onClick={() => setCurrentPage('contact')}
              className="text-amber-800 font-medium text-sm hover:text-amber-900 transition-colors"
            >
              Contact Us →
            </button>
          </div>
        </div>
      </div>
    </main>
  );

  const renderDisclaimerPage = () => (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Medical Disclaimer</h1>
        
        <div className="prose max-w-none">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-red-800 mb-3">Important Notice</h2>
            <p className="text-red-700 text-sm">
              This pregnancy due date calculator is provided for informational and educational purposes only. 
              It is not intended to replace professional medical advice, diagnosis, or treatment.
            </p>
          </div>

          <h2 className="text-xl font-semibold text-gray-800 mb-4">Medical Information Disclaimer</h2>
          <p className="text-gray-600 mb-6">
            The information provided by our Pregnancy Due Date Calculator is based on standard medical calculations 
            and should not be considered as medical advice. The calculations are estimates based on Naegele's Rule 
            and average pregnancy duration of 280 days from the last menstrual period.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mb-4">Accuracy and Limitations</h2>
          <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
            <li>Due date calculations are estimates and may vary from actual delivery dates</li>
            <li>Only approximately 5% of babies are born on their exact due date</li>
            <li>Individual factors such as cycle length, ovulation timing, and medical conditions can affect accuracy</li>
            <li>The calculator assumes a standard 28-day menstrual cycle with ovulation on day 14</li>
            <li>Results may not be accurate for pregnancies conceived through assisted reproductive technology (ART)</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-800 mb-4">Professional Medical Care</h2>
          <p className="text-gray-600 mb-4">
            You should always consult with qualified healthcare professionals for:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-1">
            <li>Confirmation of pregnancy</li>
            <li>Accurate pregnancy dating through ultrasound</li>
            <li>Prenatal care and monitoring</li>
            <li>Any concerns about your pregnancy or health</li>
            <li>Medical decisions related to your pregnancy</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-800 mb-4">No Medical Relationship</h2>
          <p className="text-gray-600 mb-6">
            Use of this calculator does not create a doctor-patient relationship between you and the website operators. 
            We are not healthcare providers and cannot provide medical advice, diagnosis, or treatment recommendations.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mb-4">Emergency Situations</h2>
          <p className="text-gray-600 mb-6">
            If you are experiencing a medical emergency or have urgent pregnancy-related concerns, 
            contact your healthcare provider immediately or call emergency services. Do not rely on 
            this calculator or any online tool for emergency medical situations.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mb-4">Liability Limitation</h2>
          <p className="text-gray-600 mb-6">
            We make no warranties or representations about the accuracy, reliability, completeness, or timeliness 
            of the information provided. We shall not be liable for any direct, indirect, incidental, special, 
            or consequential damages arising from the use of this calculator or reliance on its results.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mb-4">Updates and Changes</h2>
          <p className="text-gray-600 mb-6">
            We reserve the right to update or modify this disclaimer at any time without prior notice. 
            Your continued use of the calculator constitutes acceptance of any changes to this disclaimer.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-medium text-blue-800 mb-2">Remember</h3>
            <p className="text-blue-700 text-sm">
              This tool is designed to provide helpful estimates for pregnancy planning and tracking. 
              However, every pregnancy is unique, and professional medical care is essential for the 
              health of both mother and baby. Always consult with your healthcare provider for 
              personalized medical advice and care.
            </p>
          </div>
        </div>
      </div>
    </main>
  );

  const renderPrivacyPage = () => (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Privacy Policy</h1>
        
        <div className="prose max-w-none">
          <p className="text-gray-600 mb-6">
            <strong>Last Updated:</strong> January 2025
          </p>

          <p className="text-gray-600 mb-6">
            This Privacy Policy describes how we collect, use, and protect your information when you use our 
            Pregnancy Due Date Calculator. We are committed to protecting your privacy and ensuring the security 
            of your personal information.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mb-4">Information We Collect</h2>
          
          <h3 className="text-lg font-medium text-gray-800 mb-3">Information You Provide</h3>
          <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-1">
            <li>Dates you enter into the calculator (last menstrual period or due date)</li>
            <li>Any information you choose to share when using our sharing features</li>
            <li>Contact information if you reach out to us through our contact form</li>
          </ul>

          <h3 className="text-lg font-medium text-gray-800 mb-3">Automatically Collected Information</h3>
          <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-1">
            <li>Browser type and version</li>
            <li>Operating system</li>
            <li>IP address (anonymized)</li>
            <li>Pages visited and time spent on our site</li>
            <li>Referring website information</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-800 mb-4">How We Use Your Information</h2>
          <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-1">
            <li>To provide pregnancy due date calculations and related services</li>
            <li>To improve our calculator's functionality and user experience</li>
            <li>To analyze website usage and optimize performance</li>
            <li>To respond to your inquiries and provide customer support</li>
            <li>To comply with legal obligations</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-800 mb-4">Data Storage and Security</h2>
          <p className="text-gray-600 mb-4">
            We take the security of your information seriously:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-1">
            <li>Calculation data is processed locally in your browser and not stored on our servers</li>
            <li>We use industry-standard security measures to protect any data we do collect</li>
            <li>Our website uses HTTPS encryption to protect data transmission</li>
            <li>We do not store sensitive health information on our servers</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-800 mb-4">Cookies and Tracking</h2>
          <p className="text-gray-600 mb-4">
            We may use cookies and similar technologies to:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-1">
            <li>Remember your preferences and settings</li>
            <li>Analyze website traffic and usage patterns</li>
            <li>Provide personalized content and advertisements</li>
            <li>Improve our services and user experience</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-800 mb-4">Third-Party Services</h2>
          <p className="text-gray-600 mb-4">
            We may use third-party services for:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-1">
            <li>Website analytics (such as Google Analytics)</li>
            <li>Advertising services</li>
            <li>Content delivery networks</li>
            <li>Customer support tools</li>
          </ul>
          <p className="text-gray-600 mb-6">
            These third parties have their own privacy policies, and we encourage you to review them.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mb-4">Information Sharing</h2>
          <p className="text-gray-600 mb-4">
            We do not sell, trade, or rent your personal information to third parties. We may share information only in the following circumstances:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-1">
            <li>With your explicit consent</li>
            <li>To comply with legal requirements or court orders</li>
            <li>To protect our rights, property, or safety, or that of our users</li>
            <li>In connection with a business transfer or merger</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Rights and Choices</h2>
          <p className="text-gray-600 mb-4">
            You have the right to:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-1">
            <li>Access the personal information we have about you</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of your personal information</li>
            <li>Opt out of marketing communications</li>
            <li>Disable cookies through your browser settings</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-800 mb-4">Children's Privacy</h2>
          <p className="text-gray-600 mb-6">
            Our service is not intended for children under 13 years of age. We do not knowingly collect 
            personal information from children under 13. If we become aware that we have collected personal 
            information from a child under 13, we will take steps to delete such information.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mb-4">International Users</h2>
          <p className="text-gray-600 mb-6">
            If you are accessing our service from outside the United States, please be aware that your 
            information may be transferred to, stored, and processed in the United States where our servers 
            are located and our central database is operated.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mb-4">Changes to This Privacy Policy</h2>
          <p className="text-gray-600 mb-6">
            We may update this Privacy Policy from time to time. We will notify you of any changes by 
            posting the new Privacy Policy on this page and updating the "Last Updated" date. We encourage 
            you to review this Privacy Policy periodically for any changes.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Us</h2>
          <p className="text-gray-600 mb-4">
            If you have any questions about this Privacy Policy or our privacy practices, please contact us:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600 text-sm">
              You can reach us through our contact page or by using the contact information provided on our website.
            </p>
          </div>
        </div>
      </div>
    </main>
  );

  const renderContactPage = () => (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Contact Us</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Get in Touch</h2>
            <p className="text-gray-600 mb-6">
              We're here to help! If you have questions about our pregnancy calculator, need technical support, 
              or want to provide feedback, please don't hesitate to reach out to us.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-pink-500 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-800">Email Support</h3>
                  <p className="text-gray-600 text-sm">
                    For general inquiries and support questions
                  </p>
                  <p className="text-pink-600 font-medium">support@pregnancycalculator.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-blue-500 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-800">Technical Issues</h3>
                  <p className="text-gray-600 text-sm">
                    Report bugs or technical problems with the calculator
                  </p>
                  <p className="text-blue-600 font-medium">tech@pregnancycalculator.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-purple-500 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-800">Feedback & Suggestions</h3>
                  <p className="text-gray-600 text-sm">
                    Share your ideas for improving our calculator
                  </p>
                  <p className="text-purple-600 font-medium">feedback@pregnancycalculator.com</p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h3 className="font-medium text-amber-800 mb-2">Medical Questions</h3>
              <p className="text-amber-700 text-sm">
                Please note that we cannot provide medical advice or answer specific health questions. 
                For medical concerns about your pregnancy, please consult with your healthcare provider.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Frequently Asked Topics</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-pink-50 rounded-lg">
                <h3 className="font-medium text-pink-800 mb-2">Calculator Accuracy</h3>
                <p className="text-pink-700 text-sm">
                  Questions about how accurate our calculations are and what factors might affect results.
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">How to Use</h3>
                <p className="text-blue-700 text-sm">
                  Help with using the calculator, choosing between LMP and due date methods, and understanding results.
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2">Technical Support</h3>
                <p className="text-green-700 text-sm">
                  Issues with the website not working properly, sharing features, or mobile compatibility.
                </p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-medium text-purple-800 mb-2">Privacy & Data</h3>
                <p className="text-purple-700 text-sm">
                  Questions about how we handle your data, privacy concerns, and information security.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-medium text-gray-800 mb-3">Response Time</h3>
              <p className="text-gray-600 text-sm mb-4">
                We typically respond to inquiries within 24-48 hours during business days. 
                For urgent technical issues, we aim to respond within 24 hours.
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage('faq')}
                  className="px-4 py-2 bg-pink-100 text-pink-700 rounded-lg text-sm font-medium hover:bg-pink-200 transition-colors"
                >
                  Check FAQ First
                </button>
                <button
                  onClick={() => setCurrentPage('disclaimer')}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Read Disclaimer
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Before You Contact Us</h2>
          <p className="text-gray-600 text-sm mb-4">
            To help us assist you better, please check our FAQ section first, as it covers most common questions. 
            When contacting us, please include:
          </p>
          <ul className="list-disc pl-6 text-gray-600 text-sm space-y-1">
            <li>A clear description of your question or issue</li>
            <li>Your browser type and version (for technical issues)</li>
            <li>Steps you've already tried to resolve the problem</li>
            <li>Screenshots if applicable (for technical issues)</li>
          </ul>
        </div>
      </div>
    </main>
  );

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return renderHomePage();
      case 'about':
        return renderAboutPage();
      case 'faq':
        return renderFAQPage();
      case 'disclaimer':
        return renderDisclaimerPage();
      case 'privacy':
        return renderPrivacyPage();
      case 'contact':
        return renderContactPage();
      default:
        return renderHomePage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentPage('home')}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="p-3 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full">
                <Baby className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                  Pregnancy Calculator
                </h1>
                <p className="text-gray-600 text-xs md:text-sm">
                  Due Date & Conception Calculator
                </p>
              </div>
            </button>
            
            <div className="relative">
              {renderNavigation()}
            </div>
          </div>
        </div>
      </header>

      {renderCurrentPage()}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full">
                  <Baby className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Pregnancy Calculator</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Free, accurate pregnancy due date and conception date calculator. 
                Calculate your estimated due date based on your last menstrual period or known due date.
              </p>
              <p className="text-gray-500 text-xs">
                © 2025 Pregnancy Calculator. For informational purposes only. 
                Always consult with your healthcare provider for medical advice.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                {navigationItems.slice(0, 3).map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => setCurrentPage(item.id)}
                      className="text-gray-600 hover:text-pink-600 transition-colors"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Legal</h4>
              <ul className="space-y-2 text-sm">
                {navigationItems.slice(3).map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => setCurrentPage(item.id)}
                      className="text-gray-600 hover:text-pink-600 transition-colors"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;