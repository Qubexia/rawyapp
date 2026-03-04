import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

export interface TabOption { key: string; label: string }

interface Props {
  options: TabOption[]
  activeKey: string
  onChange: (key: string) => void
}

export const TabSwitcher: React.FC<Props> = ({ options, activeKey, onChange }) => {
  return (
    <View style={styles.container}>
      {options.map((opt) => {
        const active = opt.key === activeKey
        return (
          <TouchableOpacity key={opt.key} style={styles.button} onPress={() => onChange(opt.key)}>
            <Text style={[styles.text, active ? styles.activeText : null]}>{opt.label}</Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', backgroundColor: 'rgba(15,23,42,0.04)', borderRadius: 26, padding: 4 },
  button: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 10 },
  text: { fontSize: 14, fontWeight: '700', color: '#64748B' },
  activeText: { color: '#0F172A' },
})

export default TabSwitcher
