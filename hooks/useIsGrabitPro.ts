import { useCallback, useState } from 'react'
import { useFocusEffect } from 'expo-router'
import { isGrabitPro } from '@/services/revenuecat'

export function useIsGrabitPro() {
  const [isPro, setIsPro] = useState(false)

  useFocusEffect(
    useCallback(() => {
      let active = true
      isGrabitPro().then(pro => {
        if (active) setIsPro(pro)
      })
      return () => { active = false }
    }, [])
  )

  return isPro
}
