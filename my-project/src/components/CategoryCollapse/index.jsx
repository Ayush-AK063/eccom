import React, { useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '@mui/material/Button'
import { FaRegMinusSquare } from "react-icons/fa"
import { FaRegPlusSquare } from "react-icons/fa";
import { MyContext } from '../../App';

const CategoryCollapse = () => {

    const context = useContext(MyContext);
    const [submenuIndex, setSubmenuIndex] = useState(null);
    const [innerSubmenuIndex, setinnerSubmenuIndex] = useState(null);

    const openSubmenu = (index) => {
        setSubmenuIndex(submenuIndex === index ? null : index);
    }

    const openInnerSubmenu = (index) => {
        setinnerSubmenuIndex(innerSubmenuIndex === index ? null : index);
    }

    return (
        <>
            <div className='scroll'>
                <ul className='w-full'>
                    {context?.catData?.map((cat, index) => (
                        <li className='relative flex flex-col items-center list-none' key={cat._id}>
                            <Link to={`/productListing?catId=${cat._id}`} className='w-full'>
                                <Button className='w-full !text-left !justify-start !px-3 !text-[rgb(0,0,0,0.8)]'>
                                    {cat.name}
                                </Button>
                            </Link>

                            {cat.children?.length > 0 && (
                                submenuIndex === index ?
                                    <FaRegMinusSquare className='absolute top-[10px] right-[15px] cursor-pointer'
                                        onClick={() => openSubmenu(index)} />
                                    :
                                    <FaRegPlusSquare className='absolute top-[10px] right-[15px] cursor-pointer'
                                        onClick={() => openSubmenu(index)} />
                            )}

                            {submenuIndex === index && cat.children?.length > 0 && (
                                <ul className='w-full pl-3 submenu'>
                                    {cat.children.map((subCat, index_) => (
                                        <li className='relative list-none' key={subCat._id}>
                                            <Link to={`/productListing?subCatId=${subCat._id}`} className='w-full'>
                                                <Button className='w-full !text-left !justify-start !px-3 !text-[rgb(0,0,0,0.8)]'>
                                                    {subCat.name}
                                                </Button>
                                            </Link>

                                            {subCat.children?.length > 0 && (
                                                innerSubmenuIndex === index_ ?
                                                    <FaRegMinusSquare className='absolute top-[10px] right-[15px] cursor-pointer'
                                                        onClick={() => openInnerSubmenu(index_)} />
                                                    :
                                                    <FaRegPlusSquare className='absolute top-[10px] right-[15px] cursor-pointer'
                                                        onClick={() => openInnerSubmenu(index_)} />
                                            )}

                                            {innerSubmenuIndex === index_ && subCat.children?.length > 0 && (
                                                <ul className='w-full pl-3 inner_submenu'>
                                                    {subCat.children.map((thirdCat) => (
                                                        <li className='relative mb-1 list-none' key={thirdCat._id}>
                                                            <Link to={`/productListing?thirdSubCatId=${thirdCat._id}`}
                                                                className='link w-full !text-left !justify-start !px-3 transition text-[14px]'>
                                                                {thirdCat.name}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </>
    )
}

export default CategoryCollapse
