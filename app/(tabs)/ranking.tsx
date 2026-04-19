import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import Header from '../../components/shared/Header';
import Avatar from '../../components/ui/Avatar';
import RankBadge from '../../components/ui/RankBadge';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

const MOCK_LEADERBOARD = [
  { id: '1', username: 'alex_factcheck', points: 1250, rank: 'EXPERT' as const },
  { id: '2', username: 'truth_seeker', points: 980, rank: 'ANALYST' as const },
  { id: '3', username: 'verifier_pro', points: 840, rank: 'JOURNALIST' as const },
  { id: '4', username: 'newbie_valid', points: 420, rank: 'NOVICE' as const },
];

export default function RankingScreen() {
  return (
    <View style={styles.screen}>
      <Header showLogo />

      <View style={styles.content}>
        <Text style={styles.title}>Contributor Leaderboard</Text>
        <Text style={styles.subtitle}>Top truth-seekers this month</Text>

        <FlatList
          data={MOCK_LEADERBOARD}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <View style={styles.rankItem}>
              <Text style={styles.rankNumber}>{index + 1}</Text>
              <Avatar username={item.username} size="sm" />
              <View style={styles.userInfo}>
                <Text style={styles.username}>{item.username}</Text>
                <RankBadge rank={item.rank} />
              </View>
              <View style={styles.pointsContainer}>
                <Text style={styles.points}>{item.points}</Text>
                <Text style={styles.pointsLabel}>PTS</Text>
              </View>
            </View>
          )}
          contentContainerStyle={styles.list}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontFamily: Fonts.orbitron,
    fontSize: 20,
    color: Colors.accentPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: Fonts.oxanium,
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  list: {
    paddingBottom: 100,
  },
  rankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgSecondary,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  rankNumber: {
    fontFamily: Fonts.orbitron,
    fontSize: 18,
    color: Colors.textMuted,
    width: 30,
    textAlign: 'center',
    marginRight: 8,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  username: {
    fontFamily: Fonts.oxaniumBold,
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  pointsContainer: {
    alignItems: 'flex-end',
  },
  points: {
    fontFamily: Fonts.orbitron,
    fontSize: 16,
    color: Colors.accentPrimary,
  },
  pointsLabel: {
    fontFamily: Fonts.oxanium,
    fontSize: 9,
    color: Colors.textSecondary,
  },
});
