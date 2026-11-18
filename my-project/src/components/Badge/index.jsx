import React from 'react'

// Order status badge: pending / confirmed / shipped / delivered / cancelled
const COLORS = {
  pending: 'bg-primary text-white',
  confirmed: 'bg-blue-600 text-white',
  confirm: 'bg-blue-600 text-white',
  shipped: 'bg-amber-500 text-white',
  delivered: 'bg-green-700 text-white',
  cancelled: 'bg-gray-500 text-white',
}

const Badge = (props) => {
  return (
    <span className={`rounded-md text-[11px] px-4 py-1 capitalize inline-block ${COLORS[props.status] || 'bg-gray-200 text-gray-700'}`}>
        {props.status}
    </span>
  )
}

export default Badge
