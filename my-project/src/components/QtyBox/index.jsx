import React, { useState } from 'react'
import Button from '@mui/material/Button';
import { FaAngleUp } from "react-icons/fa";
import { FaAngleDown } from "react-icons/fa";

const QtyBox = ({ onChange }) => {

    const [qtyVal,setQtyValue] = useState(1)

    // Parent ko nayi qty batao
    const setQty = (value) => {
        const next = Math.max(1, value)
        setQtyValue(next)
        onChange?.(next)
    }

    const plusQty=()=>{
        setQty(qtyVal+1)
    }
    const minusQty=()=>{
        setQty(qtyVal-1)
    }

  return (
    <div className='relative flex items-center qtyBox'>
        <input type="number" className='w-full h-[40px] p-2 pl-5 text-[15px] focus: outline-none border border-[rgba(0,0,0,0.2)] rounded-md'
         value={qtyVal} readOnly />

         <div className='flex flex-col items-center justify-between h-[40px] absolute top-0 right-0 z-50 border-l border-[#000]'>
            <Button className='!min-w-[25px] !w-[25px] !h-[20px] !text-[#000] !rounded-none hover:!bg-[#f1f1f1]'
            onClick={plusQty}
            >
                <FaAngleUp className='tetx-[12px] opacity-55'/>
            </Button>
            <Button className='!min-w-[25px] !w-[25px] !h-[20px] !text-[#000] !rounded-none hover:!bg-[#f1f1f1]'
            onClick={minusQty}
            >
                <FaAngleDown className='tetx-[12px] opacity-55'/>
            </Button>
         </div>
    </div>
  )
}

export default QtyBox