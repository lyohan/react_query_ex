import { useState, useEffect } from 'react'
import { challengesServer } from './challengeServer'
import { useQuery } from "react-query";
import qs from 'qs'

challengesServer()

function App() {
  const [page, setPage] = useState(0)

  const { isLoading, data } = useQuery(['challenges', { page: page + 1, per_page: 10 }], async ({ queryKey }) => {
    const [, { page, per_page }] = queryKey
    const res = await fetch(`/admin/challenges?${qs.stringify({ page, per_page })}`)
    return res.json()
  }, { retry: false })

  if (isLoading) {
    return <div>Loading...</div>
  }
  return (
    <div className="App">
      {console.log('ddd', isLoading, data)}
      <button onClick={() => setPage(page + 1)}>Page up</button>
      test, {page}
    </div>
  );
}

export default App;
