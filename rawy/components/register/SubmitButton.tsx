import React from 'react'
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native'

interface Props {
  onPress?: () => void
  loading?: boolean
  style?: ViewStyle
  children?: React.ReactNode
}

export const SubmitButton: React.FC<Props> = ({ onPress, loading, style, children }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[styles.wrapper, style]} disabled={loading}>
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.text}>{children}</Text>}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
})

export default SubmitButton
