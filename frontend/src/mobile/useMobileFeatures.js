import { useEffect } from 'react'
import { App as CapacitorApp } from '@capacitor/app'

/**
 * Mobile hooks for Capacitor integration
 * - Handles Android back button
 * - Sets up native preferences
 */
export function useMobileFeatures(onBack) {
  useEffect(() => {
    // Handle Android back button
    let backPressCount = 0
    let backPressTimer = null

    const handleBackButton = () => {
      if (onBack) {
        onBack()
        return
      }

      // Double-tap back to exit
      backPressCount++
      if (backPressCount === 1) {
        backPressTimer = setTimeout(() => {
          backPressCount = 0
        }, 2000)
      } else if (backPressCount === 2) {
        CapacitorApp.exitApp()
      }
    }

    CapacitorApp.addListener('backButton', handleBackButton)

    return () => {
      CapacitorApp.removeAllListeners()
      if (backPressTimer) clearTimeout(backPressTimer)
    }
  }, [onBack])
}
