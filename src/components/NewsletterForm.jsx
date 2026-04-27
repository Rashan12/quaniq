import React, { useState } from 'react';

const NewsletterForm = ({ variant = 'default' }) => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');

        try {
            const response = await fetch('/.netlify/functions/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                setMessage("You're in. First issue lands in your inbox soon.");
                setEmail('');
            } else {
                setStatus('error');
                setMessage(data.error || 'Something went wrong. Please try again.');
            }
        } catch (err) {
            setStatus('error');
            setMessage('Network error. Please check your connection.');
        }
    };

    if (status === 'success') {
        return (
            <div className="p-4 rounded-md bg-[#2dd4bf]/10 border border-[#2dd4bf]/20 text-[#2dd4bf] text-sm animate-in fade-in duration-500">
                <p className="font-semibold">{message}</p>
            </div>
        );
    }

    const isFooter = variant === 'footer';
    const isPost = variant === 'post';

    return (
        <form onSubmit={handleSubmit} className={`flex flex-col gap-3 ${isFooter ? 'w-full' : 'max-w-lg'}`}>
            <div className="relative group">
                <input
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status === 'loading'}
                    className={`w-full rounded-md border border-[#1e1e2e] bg-[#0a0a0f] px-4 py-3 text-sm text-[#f8fafc] focus:border-[#6366f1] focus:outline-none transition-all disabled:opacity-50 ${isPost ? 'bg-[#0f0f1a]' : ''}`}
                />
                {status === 'loading' && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <svg className="animate-spin h-4 w-4 text-[#6366f1]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                )}
            </div>

            <button
                type="submit"
                disabled={status === 'loading'}
                className="rounded-md bg-[#6366f1] px-6 py-3 text-sm font-bold text-white hover:bg-[#4f46e5] transition-all disabled:opacity-50 shadow-lg shadow-[#6366f1]/20 active:scale-95"
            >
                {status === 'loading' ? 'Joining...' : 'Subscribe'}
            </button>

            {status === 'error' && (
                <p className="text-xs text-red-400 mt-2 animate-in fade-in slide-in-from-top-1">{message}</p>
            )}
        </form>
    );
};

export default NewsletterForm;
