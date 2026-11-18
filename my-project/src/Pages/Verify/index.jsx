import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import { FiArrowLeft, FiMail } from 'react-icons/fi';
import OtpBox from '../../components/OtpBox';
import AuthLayout from '../../components/AuthLayout';
import { postData } from '../../utils/api';
import { MyContext } from '../../App';

const RESEND_AFTER = 30;

// Register ke baad email verify, ya forgot-password ka OTP
const Verify = () => {
  const context = useContext(MyContext);
  const history = useNavigate();
  const email = localStorage.getItem('userEmail') || '';
  const isForgot = localStorage.getItem('actionType') === 'forgot-password';

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [wait, setWait] = useState(RESEND_AFTER);

  useEffect(() => {
    if (!email) history(isForgot ? '/forgot-password' : '/register');
  }, [email, isForgot, history]);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const verifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return context.openAlertBox('error', 'Please enter the 6-digit code');
    setLoading(true);
    const res = await postData(isForgot ? '/api/user/verify-forgot-password-otp' : '/api/user/verifyemail', { email, otp });
    setLoading(false);
    if (res?.error === false) {
      context.openAlertBox('success', res?.message || 'Verified');
      if (isForgot) {
        localStorage.setItem('otpVerified', '1');
        history('/forgot-password');
      } else {
        localStorage.removeItem('userEmail');
        history('/login');
      }
    } else {
      context.openAlertBox('error', res?.message || 'Invalid code');
    }
  };

  const resend = async () => {
    if (wait > 0 || resending) return;
    setResending(true);
    const res = await postData(isForgot ? '/api/user/forgot-password' : '/api/user/resend-otp', { email });
    setResending(false);
    if (res?.error === false) {
      context.openAlertBox('success', res?.message || 'A new code has been sent');
      setWait(RESEND_AFTER);
    } else {
      context.openAlertBox('error', res?.message || 'Could not resend the code');
    }
  };

  return (
    <AuthLayout
      title='Check your email'
      subtitle={<>We sent a 6-digit code to <b className='text-gray-900'>{email}</b></>}
      panelTitle={isForgot ? 'Let’s get you back in.' : 'One last step.'}
      panelText={isForgot ? 'Enter the code from your email to reset your password.' : 'Verify your email to activate your account and start shopping.'}
    >
      <div className='flex justify-center mb-6'>
        <span className='w-[56px] h-[56px] rounded-full bg-[#fff1f0] text-primary text-[24px] flex items-center justify-center'><FiMail /></span>
      </div>

      <form onSubmit={verifyOTP} className='flex flex-col gap-5'>
        <OtpBox length={6} onChange={setOtp} />
        <button type='submit' disabled={loading} className='authSubmit'>
          {loading ? <CircularProgress size={20} color='inherit' /> : isForgot ? 'Verify & continue' : 'Verify email'}
        </button>
      </form>

      <div className='mt-5 text-center text-[13px] text-gray-600'>
        Didn’t get the code?{' '}
        {wait > 0 ? (
          <span className='text-gray-400'>Resend in 0:{String(wait).padStart(2, '0')}</span>
        ) : (
          <button type='button' onClick={resend} disabled={resending} className='font-[700] text-primary hover:underline'>
            {resending ? 'Sending…' : 'Resend code'}
          </button>
        )}
      </div>
      <div className='mt-1 text-center text-[11px] text-gray-400'>Check your spam folder if you can’t find it.</div>

      <Link to={isForgot ? '/forgot-password' : '/register'} className='mt-6 flex items-center justify-center gap-1.5 text-[13px] font-[600] text-gray-600 hover:text-primary'>
        <FiArrowLeft /> {isForgot ? 'Use a different email' : 'Back to sign up'}
      </Link>
    </AuthLayout>
  );
};

export default Verify;
