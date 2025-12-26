
import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, ArrowRight, Github, Chrome, ShieldCheck, Sparkles, Phone, ArrowLeft, RefreshCw, CheckCircle2, AlertCircle, Info, Send } from 'lucide-react';
import { useSignIn, useSignUp } from '@clerk/clerk-react';

interface LoginProps {
  onLogin: (userData: any) => void;
}

type AuthStep = 'auth' | 'verify';

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const [isLogin, setIsLogin] = useState(false);
  const [step, setStep] = useState<AuthStep>('auth');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [showReferralNotice, setShowReferralNotice] = useState(false);
  const [toast, setToast] = useState<{message: string; code?: string} | null>(null);

  useEffect(() => {
    let interval: any;
    if (step === 'verify' && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const result = await signIn.create({
          identifier: email,
          password,
        });

        if (result.status === 'complete') {
          // User is signed in, but to get user data, use useUser
          // For now, use placeholder
          onLogin({
            id: 'clerk_' + email,
            name: 'User',
            email,
            avatar: 'https://picsum.photos/seed/' + email + '/200',
            following: []
          });
        } else {
          setShowReferralNotice(true);
        }
      } else {
        const result = await signUp.create({
          emailAddress: email,
          password,
          firstName: name,
        });

        if (result.status === 'complete') {
          onLogin({
            id: 'clerk_' + email,
            name,
            email,
            avatar: 'https://picsum.photos/seed/' + email + '/200',
            following: []
          });
        } else if (result.status === 'missing_requirements') {
          await signUp.prepareEmailAddressVerification();
          setStep('verify');
          setTimer(60);
        }
      }
    } catch (error) {
      console.error(error);
      setShowReferralNotice(true);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const enteredCode = otp.join('');
    try {
      const result = await signUp.attemptEmailAddressVerification({ code: enteredCode });
      if (result.status === 'complete') {
        onLogin({
          id: 'clerk_' + email,
          name,
          email,
          avatar: 'https://picsum.photos/seed/' + email + '/200',
          following: []
        });
      } else {
        setToast({ message: "Invalid verification code." });
      }
    } catch (error) {
      setToast({ message: "Invalid verification code." });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const renderVerificationStep = () => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="mb-8">
        <button 
          onClick={() => setStep('auth')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-xs font-bold uppercase tracking-widest mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <h3 className="text-3xl font-black mb-2">Verify</h3>
        <p className="text-slate-500 text-sm font-medium">Sent to <span className="text-violet-400">{email || phone}</span></p>
      </div>

      <form onSubmit={handleVerify} className="space-y-8">
        <div className="flex justify-between gap-2">
          {otp.map((digit, i) => (
            <input
              key={i}
              id={`otp-${i}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(i, e.target.value)}
              className="w-12 h-14 md:w-14 md:h-16 bg-slate-950 border border-slate-800 rounded-2xl text-center text-xl font-black outline-none focus:border-violet-500 transition-all"
            />
          ))}
        </div>
        <button type="submit" disabled={loading || otp.some(d => !d)} className="w-full bg-violet-600 py-4 rounded-2xl font-black text-sm disabled:opacity-50">
          {loading ? 'VERIFYING...' : 'CONFIRM'}
        </button>
      </form>
    </div>
  );

  const renderAuthStep = () => (
    <div className="animate-in fade-in slide-in-from-left-4 duration-300">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-black mb-2">{isLogin ? 'Login' : 'Register'}</h3>
        <p className="text-slate-500 text-sm">
          {isLogin ? "Need account?" : "Have account?"} 
          <button onClick={() => setIsLogin(!isLogin)} className="text-violet-400 ml-1 font-bold">
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {!isLogin && (
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm" />
        )}
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm" />
        {!isLogin && (
          <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm" />
        )}
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm" />
        <button type="submit" disabled={loading} className="w-full bg-violet-600 py-4 rounded-2xl font-black text-sm">
          {loading ? 'PROCESSING...' : (isLogin ? 'LOG IN' : 'REGISTER')}
        </button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative">
      {toast && (
        <div className="fixed top-8 z-[100] w-full max-w-sm bg-slate-900 border border-violet-500 p-4 rounded-2xl shadow-2xl">
          <p className="text-xs text-violet-400 font-black uppercase mb-1">Notice</p>
          <p className="text-sm text-slate-200">{toast.message}</p>
        </div>
      )}
      <div className="w-full max-w-md bg-slate-900/50 border border-slate-800 p-10 rounded-[40px]">
        {step === 'auth' ? renderAuthStep() : renderVerificationStep()}
      </div>
    </div>
  );
};
