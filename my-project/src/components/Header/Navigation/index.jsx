import Button from '@mui/material/Button'
import React from 'react'
import { RiMenu2Fill } from "react-icons/ri";
import { FaAngleDown } from "react-icons/fa6";
import { Link } from 'react-router-dom';
import { IoRocketOutline } from "react-icons/io5";
import CategoryPanel from './CategoryPanel';
import { useState, useContext } from 'react';
import { MyContext } from '../../../App';
import './style.css'

const Navigation = () => {
    const [isopenCatPanel, setIsOpenCatPanel] = useState(false)
    const context = useContext(MyContext)

    const openCategoryPanel = () => {
        setIsOpenCatPanel(!isopenCatPanel)

    }

  return (
    <>
    <nav>
        <div className='container flex items-center justify-end w-full gap-8'>
            <div className='col_1 w-[25%]'>
                <Button className='!text-black gap-2 w-full' onClick={openCategoryPanel}>
                    <RiMenu2Fill  className='text-[18px]'/>
                    SHOP BY CATEGORIES
                    <FaAngleDown className='text-[13px] ml-auto font-bold'/>
                </Button>
            </div>
            <div className='col_2 w-[50%]'>
                <ul className='flex items-center gap-3 nav'>
                    <li className='list-none'>
                        <Link to='/' className='text-[14px] font-[500]'>
                            <Button className='link transition !font-[500] !text-[rgba(0,0,0,0.8)] hover:!text-[#ff5252] !py-4'>
                                Home
                            </Button>
                        </Link>
                    </li>
                    {context?.catData?.slice(0, 7).map((cat) => (
                        <li className='relative list-none' key={cat._id}>
                            <Link to={`/productListing?catId=${cat._id}`} className='link transition text-[14px] font-[500]'>
                                <Button className='link transition !font-[500] !text-[rgba(0,0,0,0.8)] hover:!text-[#ff5252] !py-4'>
                                    {cat.name}
                                </Button>
                            </Link>

                            {cat.children?.length > 0 && (
                                <div className='submenu absolute top-[120%] left-[0%] min-w-[150px] bg-white shadow-md opacity-0 transition-all'>
                                    <ul>
                                        {cat.children.map((subCat) => (
                                            <li className='relative w-full list-none' key={subCat._id}>
                                                <Link to={`/productListing?subCatId=${subCat._id}`} className='w-full'>
                                                    <Button className='!text-[rgba(0,0,0,0.8)] w-full !text-left !justify-start !rounded-none'>
                                                        {subCat.name}
                                                    </Button>
                                                </Link>

                                                {subCat.children?.length > 0 && (
                                                    <div className='submenu absolute top-[0%] left-[100%] min-w-[150px] bg-white shadow-md opacity-0 transition-all'>
                                                        <ul>
                                                            {subCat.children.map((thirdCat) => (
                                                                <li className='w-full list-none' key={thirdCat._id}>
                                                                    <Link to={`/productListing?thirdSubCatId=${thirdCat._id}`} className='w-full'>
                                                                        <Button className='!text-[rgba(0,0,0,0.8)] w-full !text-left !justify-start !rounded-none'>
                                                                            {thirdCat.name}
                                                                        </Button>
                                                                    </Link>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
            <div className='col_3 w-[25%]'>
                <p className='text-[13px] font-[500] flex items-center gap-3 mb-0 mt-0'>
                    <IoRocketOutline className='text-[18px] font-[500]'/>
                    Free Delivery above 999
                </p>
            </div>
        </div>
    </nav>

    {/* category panel component */}
    <CategoryPanel 
    openCategoryPanel={openCategoryPanel} 
    isopenCatPanel={isopenCatPanel}
    setIsOpenCatPanel={setIsOpenCatPanel}/>
    </>
  )
}

export default Navigation