import React, { useContext, useEffect, useState } from 'react'
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import './style.css'
import {Collapse} from 'react-collapse';
import { FaAngleDown } from "react-icons/fa6";
import { FaAngleUp } from "react-icons/fa6";
import Button from '@mui/material/Button';
import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';
import Rating from '@mui/material/Rating';
import { MyContext } from '../../App';
import { getData } from '../../utils/api';

export const PRICE_MIN = 0
export const PRICE_MAX = 100000

const SideBar = ({ filters, setFilters }) => {

    const context = useContext(MyContext)
    const [isOpenCategoryFilter,setisOpenCategoryFilter] = useState(true)
    const [isOpenAvailabilityFilter,setisOpenAvailabilityFilter] = useState(true)
    const [isOpenSizeFilter,setisOpenSizeFilter] = useState(true)
    const [sizes, setSizes] = useState([])
    const [price, setPrice] = useState([filters.minPrice, filters.maxPrice])

    useEffect(() => {
        // Admin → Variant Options ka "Size" (purani productSize list nahi)
        getData('/api/variantOption').then((res) => {
            const opt = (res?.data || []).find((o) => o.name?.toLowerCase() === 'size')
            setSizes((opt?.values || []).map((v) => ({ _id: v.value, name: v.value })))
        })
    }, [])

    // Bahar se filters reset ho (category link click) to slider bhi reset
    useEffect(() => {
        setPrice([filters.minPrice, filters.maxPrice])
    }, [filters.minPrice, filters.maxPrice])

    // Slider rukne ke 500ms baad hi API call (har pixel par nahi)
    useEffect(() => {
        if (price[0] === filters.minPrice && price[1] === filters.maxPrice) return
        const timer = setTimeout(() => {
            setFilters((prev) => ({ ...prev, minPrice: price[0], maxPrice: price[1] }))
        }, 500)
        return () => clearTimeout(timer)
    }, [price])

    // Array filter mein value add/remove
    const toggleValue = (key, value) => {
        setFilters((prev) => {
            const list = prev[key] || []
            return {
                ...prev,
                [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
            }
        })
    }

    // Root category checkbox: sub/third category filter hata do taaki selection saaf rahe
    const toggleCategory = (id) => {
        setFilters((prev) => ({
            ...prev,
            subCatId: [],
            thirdSubCatId: [],
            catId: prev.catId.includes(id) ? prev.catId.filter((v) => v !== id) : [...prev.catId, id],
        }))
    }

  return (
    <aside className='py-5 sideBar'>
        <div className='box'>
            <h3 className='w-full mb-3 text-[16px] font-[600] flex items-center pr-5'>
                Shop by Category
                <Button className='!w-[30px] !h-[30px] !min-w-[30px] !rounded-full !ml-auto !text-black'
                 onClick={()=>setisOpenCategoryFilter(!isOpenCategoryFilter)}>
                    {
                        isOpenCategoryFilter === true ? <FaAngleUp/> : <FaAngleDown/>
                    }
                </Button>
            </h3>
            <Collapse isOpened={isOpenCategoryFilter}>
                <div className='relative px-4 scroll -left-[13px]'>
                    {context?.catData?.map((cat) => (
                        <FormControlLabel
                            key={cat._id}
                            control={<Checkbox size='small'
                                checked={filters.catId.includes(cat._id)}
                                onChange={() => toggleCategory(cat._id)} />}
                            label={cat.name}
                            className='w-full' />
                    ))}
                </div>
            </Collapse>
        </div>

        <div className='box'>
            <h3 className='w-full mb-3 text-[16px] font-[600] flex items-center pr-5'>
                Availability
                <Button className='!w-[30px] !h-[30px] !min-w-[30px] !rounded-full !ml-auto !text-black'
                 onClick={()=>setisOpenAvailabilityFilter(!isOpenAvailabilityFilter)}>
                    {
                        isOpenAvailabilityFilter === true ? <FaAngleUp/> : <FaAngleDown/>
                    }
                </Button>
            </h3>
            <Collapse isOpened={isOpenAvailabilityFilter}>
                <div className='relative px-4 scroll -left-[13px]'>
                    <FormControlLabel
                        control={<Checkbox size='small'
                            checked={filters.availability.includes('inStock')}
                            onChange={() => toggleValue('availability', 'inStock')} />}
                        label="In Stock" className='w-full' />
                    <FormControlLabel
                        control={<Checkbox size='small'
                            checked={filters.availability.includes('outOfStock')}
                            onChange={() => toggleValue('availability', 'outOfStock')} />}
                        label="Out of Stock" className='w-full' />
                </div>
            </Collapse>
        </div>

        {sizes.length > 0 && (
            <div className='mt-3 box'>
                <h3 className='w-full mb-3 text-[16px] font-[600] flex items-center pr-5'>
                    Size
                    <Button className='!w-[30px] !h-[30px] !min-w-[30px] !rounded-full !ml-auto !text-black'
                     onClick={()=>setisOpenSizeFilter(!isOpenSizeFilter)}>
                        {
                            isOpenSizeFilter === true ? <FaAngleUp/> : <FaAngleDown/>
                        }
                    </Button>
                </h3>
                <Collapse isOpened={isOpenSizeFilter}>
                    <div className='relative px-4 scroll -left-[13px]'>
                        {sizes.map((s) => (
                            <FormControlLabel
                                key={s._id}
                                control={<Checkbox size='small'
                                    checked={filters.size.includes(s.name)}
                                    onChange={() => toggleValue('size', s.name)} />}
                                label={s.name}
                                className='w-full' />
                        ))}
                    </div>
                </Collapse>
            </div>
        )}

        <div className='mt-4 box'>
            <h3 className='w-full mb-3 text-[16px] font-[600] flex items-center pr-5'>
                Filter By Price
            </h3>

            <RangeSlider
                min={PRICE_MIN}
                max={PRICE_MAX}
                step={100}
                value={price}
                onInput={setPrice}
            />
            <div className='flex pt-4 pb-2 priceRange'>
                <span className='text-[13px] flex items-center'>
                    From:&nbsp;<div className='font-semibold text-dark'>Rs {price[0]}</div>
                </span>
                <span className='ml-auto text-[13px]'>
                    To:&nbsp;<strong className='text-dark'>Rs {price[1]}</strong>
                </span>
            </div>
        </div>

        <div className='mt-4 box'>
            <h3 className='w-full mb-3 text-[16px] font-[600] flex items-center pr-5'>
                Filter By Rating
            </h3>

            <div>
                {[5, 4, 3, 2, 1].map((star) => (
                    <div className='flex items-center w-full' key={star}>
                        <Checkbox size='small'
                            checked={filters.rating.includes(star)}
                            onChange={() => toggleValue('rating', star)} />
                        <Rating name={`rating-${star}`} value={star} size="small" readOnly/>
                    </div>
                ))}
            </div>
        </div>
    </aside>
  )
}

export default SideBar
