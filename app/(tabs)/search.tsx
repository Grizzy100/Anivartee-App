import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import Header from '../../components/shared/Header';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { useSession } from '../../ctx';
import { getFeed } from '../../lib/api/postApi';

export default function SearchScreen() {
  const { session } = useSession();
  const [query, setQuery] = useState('');
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getFeed(1, 'trending', session || undefined);
      setPosts(res.posts || []);
    } catch (error) {
      console.error('Failed to load search feed:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      loadFeed();
    }, [loadFeed])
  );

  const displayPosts = posts.filter((post) =>
    query.length === 0
      || post.title?.toLowerCase().includes(query.toLowerCase())
      || post.description?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View style={styles.screen}>
      <Header showLogo />

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Colors.textMuted} />
          <TextInput
            style={styles.input}
            placeholder="Search posts or fact-checkers..."
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={setQuery}
          />
        </View>
      </View>

      {loading ? (
        <View style={[styles.placeholderContainer, { paddingBottom: 0 }]}>
          <ActivityIndicator color={Colors.accentPrimary} size="large" />
        </View>
      ) : displayPosts.length > 0 ? (
        <FlatList
          data={displayPosts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.trendingList}
          refreshing={loading}
          onRefresh={loadFeed}
          renderItem={({ item }) => (
            <Pressable style={styles.trendingItem}>
              <View style={styles.trendingHeader}>
                <Text style={styles.trendingCategory}>{item.status || 'News'} • Trending</Text>
                <Ionicons name="ellipsis-horizontal" size={16} color={Colors.textMuted} />
              </View>
              <Text style={styles.trendingTitle}>{item.title}</Text>
              <Text style={styles.trendingPosts}>{item._count?.likes || 0} Likes • {item._count?.comments || 0} Comments</Text>
            </Pressable>
          )}
        />
      ) : (
        <View style={styles.placeholderContainer}>
          {query.length > 0 ? (
            <>
              <Ionicons name="search-outline" size={64} color={Colors.bgTertiary} />
              <Text style={styles.placeholderText}>Nothing to see yet</Text>
            </>
          ) : (
            <Text style={styles.placeholderText}>Nothing to see yet</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  searchContainer: {
    padding: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgSecondary,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    color: Colors.textPrimary,
    fontFamily: Fonts.oxanium,
    fontSize: 16,
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  placeholderText: {
    fontFamily: Fonts.oxanium,
    fontSize: 16,
    color: Colors.textMuted,
    marginTop: 16,
  },
  trendingList: {
    paddingTop: 8,
    paddingBottom: 100,
  },
  trendingItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderDefault,
  },
  trendingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  trendingCategory: {
    fontFamily: Fonts.oxanium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  trendingTitle: {
    fontFamily: Fonts.oxaniumBold,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  trendingPosts: {
    fontFamily: Fonts.oxanium,
    fontSize: 13,
    color: Colors.textMuted,
  },
});
