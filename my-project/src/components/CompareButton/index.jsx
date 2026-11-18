import React from 'react';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { IoGitCompareOutline } from 'react-icons/io5';
import { FiCheck } from 'react-icons/fi';
import { useCompare } from '../../context/CompareContext';

// variant="icon" -> card ka gol button | variant="text" -> product page ka link
const CompareButton = ({ product, variant = 'icon' }) => {
    const { isInCompare, toggleCompare } = useCompare();
    const added = isInCompare(product?._id);

    if (variant === 'text') {
        return (
            <span
                role='button'
                tabIndex={0}
                onClick={() => product && toggleCompare(product)}
                onKeyDown={(e) => e.key === 'Enter' && product && toggleCompare(product)}
                className={`flex items-center gap-1 text-[15px] link cursor-pointer font-[500] ${added ? 'text-primary' : ''}`}
            >
                {added ? <FiCheck className='text-[18px]' /> : <IoGitCompareOutline className='text-[18px]' />}
                {added ? 'Added to Compare' : 'Add to Compare'}
            </span>
        );
    }

    return (
        <Tooltip title={added ? 'Remove from compare' : 'Add to compare'} placement='left'>
            <Button
                onClick={() => product && toggleCompare(product)}
                aria-pressed={added}
                className={`!w-[35px] !h-[35px] !min-w-[35px] !rounded-full !shadow-md group/cmp hover:!bg-primary ${added ? '!bg-primary' : '!bg-white'}`}
            >
                {added
                    ? <FiCheck className='text-[17px] !text-white' />
                    : <IoGitCompareOutline className='text-[17px] !text-gray-800 group-hover/cmp:!text-white' />}
            </Button>
        </Tooltip>
    );
};

export default CompareButton;
