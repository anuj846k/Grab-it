import { useCallback, useRef, useState } from 'react'
import { useAuth } from '@clerk/expo'
import { useFocusEffect } from 'expo-router'
import { createClerkSupabaseClient } from '@/utils/supabase'

export function usePendingRequestsCount() {
  const { getToken, userId } = useAuth()
  const [count, setCount] = useState(0)
  const getTokenRef = useRef(getToken)
  const userIdRef = useRef(userId)
  getTokenRef.current = getToken
  userIdRef.current = userId

  useFocusEffect(
    useCallback(() => {
      let active = true

      const fetchCount = async () => {
        const currentUserId = userIdRef.current
        if (!currentUserId) return

        const token = await getTokenRef.current({ template: 'supabase' })
        if (!token) return

        const supabase = createClerkSupabaseClient(token)

        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('clerk_id', currentUserId)
          .single()

        if (!userData) return

        const { data: listings } = await supabase
          .from('listings')
          .select('id')
          .eq('user_id', userData.id)

        const listingIds = listings?.map(l => l.id) ?? []
        if (listingIds.length === 0) {
          if (active) setCount(0)
          return
        }

        const { count: pendingCount } = await supabase
          .from('claims')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending')
          .in('listing_id', listingIds)

        if (active) setCount(pendingCount ?? 0)
      }

      fetchCount()

      return () => { active = false }
    }, [])
  )

  return count
}
