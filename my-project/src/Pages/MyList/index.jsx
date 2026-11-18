import React, { useContext, useEffect } from 'react'
import { Link } from 'react-router-dom';
import { Button } from '@mui/material';
import { FaRegHeart } from 'react-icons/fa';
import MyListItems from './MyListItems';
import AccountSidebar from '../../components/AccountSidebar';
import { MyContext } from '../../App';

const MyList = () => {
  const context = useContext(MyContext)
  const list = context?.myListData || []

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <section className='w-full py-10'>
      <div className='container flex gap-5'>
        <div className='col1 w-[20%]'>
          <div className='sticky top-[160px]'>
            <AccountSidebar />
          </div>
        </div>

        <div className='col2 w-[70%]'>
          <div className='bg-white rounded-md shadow-md'>
            <div className='px-3 py-5 border-b border-[rgba(0,0,0,0.1)]'>
              <h2>My List</h2>
              <p className='mt-0 mb-0'>
                There {list.length === 1 ? 'is' : 'are'} <span className='font-bold text-primary'>{list.length}</span>{' '}
                {list.length === 1 ? 'product' : 'products'} in your list
              </p>
            </div>

            {list.length > 0 ? (
              list.map((item) => <MyListItems key={item._id} item={item} />)
            ) : (
              <div className='flex flex-col items-center justify-center gap-3 py-10'>
                <FaRegHeart className='text-[100px] text-[rgba(0,0,0,0.25)]' />
                <h3 className='text-[18px] font-[600]'>My List is currently empty</h3>
                {!context?.isLogin && <p className='mt-0'>Please <Link to='/login' className='link text-primary font-[600]'>login</Link> to see your list.</p>}
                <Link to='/'><Button className='btn-org'>Continue Shopping</Button></Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default MyList
