import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing } from '../../constants/layout';

export type MainTab = 'feed' | 'moderation';
export type SubTab = 'queue' | 'claimed';

interface DashboardTabsProps {
  activeMainTab: MainTab;
  onMainTabChange: (tab: MainTab) => void;
  activeSubTab?: SubTab;
  onSubTabChange?: (tab: SubTab) => void;
}

export default function DashboardTabs({
  activeMainTab,
  onMainTabChange,
  activeSubTab,
  onSubTabChange,
}: DashboardTabsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.mainTabRow}>
        <TouchableOpacity
          style={[styles.mainTab, activeMainTab === 'feed' && styles.mainTabActive]}
          onPress={() => onMainTabChange('feed')}
        >
          <Text style={[styles.mainTabText, activeMainTab === 'feed' && styles.mainTabTextActive]}>
            Main feed
          </Text>
        </TouchableOpacity>
        
        <View style={styles.divider} />

        <TouchableOpacity
          style={[styles.mainTab, activeMainTab === 'moderation' && styles.mainTabActive]}
          onPress={() => onMainTabChange('moderation')}
        >
          <Text style={[styles.mainTabText, activeMainTab === 'moderation' && styles.mainTabTextActive]}>
            Moderation
          </Text>
        </TouchableOpacity>
      </View>

      {activeMainTab === 'moderation' && onSubTabChange && (
        <View style={styles.subTabRow}>
          <TouchableOpacity
            style={[styles.subTab, activeSubTab === 'queue' && styles.subTabActive]}
            onPress={() => onSubTabChange('queue')}
          >
            <Text style={[styles.subTabText, activeSubTab === 'queue' && styles.subTabTextActive]}>
              Queue
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subTab, activeSubTab === 'claimed' && styles.subTabActive]}
            onPress={() => onSubTabChange('claimed')}
          >
            <Text style={[styles.subTabText, activeSubTab === 'claimed' && styles.subTabTextActive]}>
              Claimed
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.bgPrimary,
  },
  mainTabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderDefault,
    marginBottom: Spacing.md,
  },
  mainTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  mainTabActive: {
    borderBottomColor: Colors.textLink,
  },
  mainTabText: {
    fontFamily: Fonts.oxaniumBold,
    fontSize: 15,
    color: Colors.textSecondary,
  },
  mainTabTextActive: {
    color: Colors.textPrimary,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.borderDefault,
  },
  subTabRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  subTab: {
    flex: 1,
    backgroundColor: Colors.bgSecondary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  subTabActive: {
    backgroundColor: Colors.bgTertiary,
    borderColor: Colors.accentPrimary,
  },
  subTabText: {
    fontFamily: Fonts.oxanium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  subTabTextActive: {
    color: Colors.accentPrimary,
    fontFamily: Fonts.oxaniumBold,
  },
});
