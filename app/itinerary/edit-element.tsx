"use client"

import { useRouter } from 'next/navigation';
import React from 'react'
import { FiEdit } from "react-icons/fi";

const  EditElement = ({ itineraryId }: { itineraryId: string }) => {
  const router = useRouter()
  return (
    <FiEdit size={35}
        onClick={() => {
            router.push(`/create?itineraryId=${itineraryId}`)
        }}
        className={`transition-colors cursor-pointer h-10 w-10 text-black hover:bg-gray-100 rounded-lg p-2`}
    />
  )
}

export default EditElement