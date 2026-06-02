import { useState, useEffect, useCallback } from 'react'

/**
 * Hook genérico para carregar dados assíncronos.
 * @param {Function} fetchFn — função que retorna uma Promise
 * @param {Array} deps — dependências para re-executar
 */
export function useData(fetchFn, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const execute = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchFn()
      setData(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, deps) // eslint-disable-line

  useEffect(() => { execute() }, [execute])

  return { data, loading, error, refetch: execute }
}
