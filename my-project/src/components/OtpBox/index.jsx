import React, { useState } from 'react'

const OtpBox = ({ length, onChange }) => {
    const [otp,setOtp] = useState(new Array(length).fill(""));

    const handleChange = (element,index) =>{
        const value = element.value;
        if (isNaN(value))
            return; //only num allowed

        //update otp value
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        onChange(newOtp.join(""));

        //focus on next input
        if (value && index < length-1){
            document.getElementById(`otp-input-${index + 1}`).focus();
        }
    };
    
    // Poora code paste kiya -> sab boxes bhar do
    const handlePaste = (event) => {
        const digits = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length).split('');
        if (!digits.length) return;
        event.preventDefault();
        const newOtp = new Array(length).fill('').map((_, i) => digits[i] || '');
        setOtp(newOtp);
        onChange(newOtp.join(''));
        document.getElementById(`otp-input-${Math.min(digits.length, length - 1)}`)?.focus();
    };

    const handleKeyDown = (event, index) => {
        if (event.key === "Backspace" && !otp[index] && index > 0){
            document.getElementById(`otp-input-${index-1}`).focus();
        }
    };

  return (
    <div className='flex otpBox gap-2 justify-center' onPaste={handlePaste}>
        {otp.map((data,index) => (
            <input 
                key={index}
                id={`otp-input-${index}`}
                type="text"
                inputMode="numeric"
                autoComplete={index === 0 ? 'one-time-code' : 'off'}
                aria-label={`Digit ${index + 1}`}
                maxLength="1"
                value={otp[index]}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className='w-[48px] h-[54px] text-center text-[20px] font-[700] text-gray-900'
                />
        ))}
    </div>
  )
}

export default OtpBox