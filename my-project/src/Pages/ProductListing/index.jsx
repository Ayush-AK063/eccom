import React, { useContext, useEffect, useState } from 'react'
import SideBar, { PRICE_MIN, PRICE_MAX } from '../../components/sideBar'
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { Link, useLocation } from 'react-router-dom';
import ProductItem from '../../components/ProductItem';
import Button from '@mui/material/Button';
import { IoGrid } from "react-icons/io5";
import { IoMenu } from "react-icons/io5";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import ProductItemListView from '../../components/ProductItemListView';
import Pagination from '@mui/material/Pagination';
import { postData } from '../../utils/api';
import { MyContext } from '../../App';

const emptyFilters = () => ({
  catId: [],
  subCatId: [],
  thirdSubCatId: [],
  minPrice: PRICE_MIN,
  maxPrice: PRICE_MAX,
  rating: [],
  availability: [],
  size: [],
  search: '',
})

const sortOptions = [
  { label: 'Relevance', sortBy: '', order: '' },
  { label: 'Name, A to Z', sortBy: 'name', order: 'asc' },
  { label: 'Name, Z to A', sortBy: 'name', order: 'desc' },
  { label: 'Price, low to high', sortBy: 'price', order: 'asc' },
  { label: 'Price, high to low', sortBy: 'price', order: 'desc' },
  { label: 'Rating, high to low', sortBy: 'rating', order: 'desc' },
]

// Category tree mein id dhoondho (breadcrumb ke naam ke liye)
const findCatName = (tree = [], id) => {
  for (const cat of tree) {
    if (cat._id === id) return cat.name
    const found = findCatName(cat.children, id)
    if (found) return found
  }
  return null
}

const ProductListing = () => {

  const [ItemView, setItemView] = useState("grid")
  const [anchorEl, setAnchorEl] = useState(null);
  const [filters, setFilters] = useState(emptyFilters)
  const [sortIndex, setSortIndex] = useState(0)
  const [page, setPage] = useState(1)
  const [productsData, setProductsData] = useState({ products: [], total: 0, totalPages: 0 })
  const [isLoading, setIsLoading] = useState(false)

  const context = useContext(MyContext)
  const location = useLocation()
  const open = Boolean(anchorEl);

  // URL (?catId= / ?subCatId= / ?thirdSubCatId=) badle to filters reset karke wahi category lagao
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const next = emptyFilters()
    if (params.get('catId')) next.catId = [params.get('catId')]
    if (params.get('subCatId')) next.subCatId = [params.get('subCatId')]
    if (params.get('thirdSubCatId')) next.thirdSubCatId = [params.get('thirdSubCatId')]
    if (params.get('q')) next.search = params.get('q').trim()
    // Home ke 'Deals under ₹X' tiles se
    if (params.get('maxPrice') && !isNaN(+params.get('maxPrice'))) next.maxPrice = +params.get('maxPrice')
    if (params.get('minPrice') && !isNaN(+params.get('minPrice'))) next.minPrice = +params.get('minPrice')
    setFilters(next)
    setPage(1)
    window.scrollTo(0, 0)
  }, [location.search])

  // Filters / sort / page badle to products dobara lao
  useEffect(() => {
    let ignore = false
    setIsLoading(true)
    const { sortBy, order } = sortOptions[sortIndex]
    postData('/api/product/filters', { ...filters, sortBy, order, page, limit: 12 }).then((res) => {
      if (ignore) return
      if (res?.error === false) {
        setProductsData({ products: res.products || [], total: res.total || 0, totalPages: res.totalPages || 0 })
      } else {
        setProductsData({ products: [], total: 0, totalPages: 0 })
      }
      setIsLoading(false)
    })
    return () => { ignore = true }
  }, [filters, sortIndex, page])

  // Sidebar se filter change → page 1 se shuru
  const updateFilters = (updater) => {
    setFilters((prev) => (typeof updater === 'function' ? updater(prev) : updater))
    setPage(1)
  }

  const handleSort = (index) => {
    setSortIndex(index)
    setPage(1)
    setAnchorEl(null)
  }

  const selectedId = filters.thirdSubCatId[0] || filters.subCatId[0] || (filters.catId.length === 1 ? filters.catId[0] : null)
  const catName = selectedId ? findCatName(context?.catData, selectedId) : null

  return (
    <section className='py-5 pb-0'>
        <div className='container'>
            <Breadcrumbs aria-label="breadcrumb">
                <Link to="/" className='transition-all link'>
                    Home
                </Link>
                <span className='text-[rgba(0,0,0,0.8)]'>
                    {filters.search ? `Search: "${filters.search}"` : (catName || 'All Products')}
                </span>
            </Breadcrumbs>
        </div>
        <div className='p-2 mt-4 bg-white'>
            <div className='container flex gap-3'>
                <div className='sideBarWrapper w-[20%] h-full'>
                    <SideBar filters={filters} setFilters={updateFilters} />
                </div>

                <div className='rightContent w-[80%] py-3'>
                    <div className='bg-[#f1f1f1] w-full p-2 mb-4 rounded-md flex items-center justify-between'>
                        <div className='flex items-center col1 itemViewActions'>
                            <Button
                            className={`!w-[40px] !h-[40px] !min-w-[40px] !rounded-full !text-[#000]
                                       ${ItemView === 'list' && 'active'}`}
                            onClick={()=>setItemView("list")}
                            >
                                <IoMenu className='text-[rgba(0,0,0,0.7)]'/>
                            </Button>

                            <Button
                            className={`!w-[40px] !h-[40px] !min-w-[40px] !rounded-full !text-[#000]
                                       ${ItemView === 'grid' && 'active'}`}
                            onClick={()=>setItemView("grid")}
                            >
                                <IoGrid className='text-[rgba(0,0,0,0.7)]'/>
                            </Button>

                            <span className='text-[14px] font-[500] pl-3 text-[rgba(0,0,0,0.7)]'>
                                {filters.search
                                    ? <>{productsData.total} {productsData.total === 1 ? 'product' : 'products'} found for <span className='text-primary'>"{filters.search}"</span></>
                                    : <>There are {productsData.total} products.</>}
                            </span>
                        </div>

                        <div className='flex items-center justify-end gap-3 pr-4 ml-auto col2'>
                        <span className='text-[14px] font-[500] pl-3 text-[rgba(0,0,0,0.7)]'>Sort By:</span>

                        <Button
                            id="basic-button"
                            aria-controls={open ? 'basic-menu' : undefined}
                            aria-haspopup="true"
                            aria-expanded={open ? 'true' : undefined}
                            onClick={(e) => setAnchorEl(e.currentTarget)}
                            className='!bg-white !text-[14px] !text-[#000] !captialize !border-2 !border-[#000]'
                        >
                            {sortOptions[sortIndex].label}
                        </Button>

                        <Menu
                            id="basic-menu"
                            anchorEl={anchorEl}
                            open={open}
                            onClose={() => setAnchorEl(null)}
                            MenuListProps={{
                            'aria-labelledby': 'basic-button',
                            }}
                        >
                            {sortOptions.map((opt, index) => (
                                <MenuItem key={opt.label} onClick={() => handleSort(index)}
                                selected={index === sortIndex}
                                className='!text-[13px] !text-[#000] !captialize'
                                >{opt.label}</MenuItem>
                            ))}
                        </Menu>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className='flex items-center justify-center w-full min-h-[400px]'>
                            <CircularProgress color="inherit" />
                        </div>
                    ) : productsData.products.length === 0 ? (
                        <div className='flex flex-col items-center justify-center w-full min-h-[300px] gap-2'>
                            <h3 className='text-[18px] font-[600]'>
                                {filters.search ? `No products found for "${filters.search}"` : 'No products found'}
                            </h3>
                            <p className='text-[14px] text-[rgba(0,0,0,0.6)]'>
                                {filters.search ? 'Try a different word or remove some filters.' : 'Try removing some filters.'}
                            </p>
                            <Link to='/'><Button className='btn-org'>Continue Shopping</Button></Link>
                        </div>
                    ) : (
                        <div className={`gap-4 ${ItemView==='grid' ? 'grid grid-cols-4 md:grid-cols-4' : 'grid grid-cols-1 md:grid-cols-1'}`}>
                            {productsData.products.map((item) => (
                                ItemView === 'grid'
                                    ? <ProductItem key={item._id} item={item} />
                                    : <ProductItemListView key={item._id} item={item} />
                            ))}
                        </div>
                    )}

                    {productsData.totalPages > 1 && (
                        <div className='flex items-center justify-center mt-10'>
                            <Pagination
                                count={productsData.totalPages}
                                page={page}
                                onChange={(e, value) => { setPage(value); window.scrollTo(0, 0) }}
                                showFirstButton
                                showLastButton
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    </section>
  )
}

export default ProductListing
