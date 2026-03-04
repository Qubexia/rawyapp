import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ModalScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">عن راوي</ThemedText>
      <ThemedText style={styles.text}>
        راوي هو تطبيق لسماع واكتشاف البودكاست، مع واجهة بسيطة وتجربة مريحة للمستخدم.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    marginTop: 12,
    textAlign: 'center',
  },
});
