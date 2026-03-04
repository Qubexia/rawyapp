import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

interface Props {
  message?: string | null
}

export const ErrorBanner: React.FC<Props> = ({ message }) => {
  if (!message) return null
  return (
    <View style={styles.wrapper}>
      <Text style={styles.text}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'rgba(239,68,68,0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  text: { color: '#B91C1C', fontSize: 13, fontWeight: '500' },
})

export default ErrorBanner
