import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Header from '../../components/shared/Header';
import ModerationDashboard from '../../components/dashboard/ModerationDashboard';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing } from '../../constants/layout';
import { useSession } from '../../ctx';

export default function ModerationScreen() {
  const { session } = useSession();
  const [activeSubTab, setActiveSubTab] = useState<'queue' | 'claimed'>('queue');

  if (!session) return null;

  return (
    <View style={styles.screen}>
      <Header title="Moderation Dashboard" />
      
      <View style={styles.subtitle}>
        <Text style={styles.subtitleText}>Review and verify reported submissions</Text>
      </View>

      <View style={styles.toggleRow}>
        <TouchableOpacity 
          style={[styles.toggleBtn, activeSubTab === 'queue' && styles.toggleBtnActive]} 
          onPress={() => setActiveSubTab('queue')}
        >
          <Text style={[styles.toggleText, activeSubTab === 'queue' && styles.toggleTextActive]}>Queue</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.toggleBtn, activeSubTab === 'claimed' && styles.toggleBtnActive]} 
          onPress={() => setActiveSubTab('claimed')}
        >
          <Text style={[styles.toggleText, activeSubTab === 'claimed' && styles.toggleTextActive]}>My Claims</Text>
        </TouchableOpacity>
      </View>

      <ModerationDashboard session={session} activeSubTab={activeSubTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bgPrimary },
  subtitle: { paddingHorizontal: Spacing.base, paddingBottom: 12 },
  subtitleText: { fontFamily: Fonts.oxanium, fontSize: 13, color: Colors.textSecondary },
  toggleRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
  },
  toggleBtn: {
    paddingHorizontal: Spacing.base,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.bgSecondary,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  toggleBtnActive: {
    backgroundColor: Colors.bgTertiary,
    borderColor: Colors.accentPrimary,
  },
  toggleText: { fontFamily: Fonts.oxaniumBold, fontSize: 13, color: Colors.textSecondary },
  toggleTextActive: { color: Colors.accentPrimary },
});
