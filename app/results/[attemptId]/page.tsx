"use client"
import {useParams} from 'next/navigation'

const Result = () => {
  const {attemptId} = useParams()

  return (
   <>
   <h1>Test Results</h1>
   <p>Attempt ID: {attemptId}</p>
   </>
  )
}

export default Result
