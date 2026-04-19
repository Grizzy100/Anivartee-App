// app/posts/[id].tsx — Post Detail + Comments Screen
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useEffect, useCallback } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
    Alert
} from "react-native";
import { useSafeAreaInsets, SafeAreaView } from "react-native-safe-area-context";
import PostCard from "../../components/feed/PostCard";
import Avatar from "../../components/ui/Avatar";
import { Colors } from "../../constants/colors";
import { Fonts } from "../../constants/fonts";
import { Spacing, Typography } from "../../constants/layout";
import { useSession } from "../../ctx";
import { getPostById, getComments, addComment, toggleLikePost, toggleFlagPost } from "../../lib/api/postApi";

export default function PostDetailScreen() {
    const { id } = useLocalSearchParams();
    const { session, user } = useSession();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [commentText, setCommentText] = useState("");
    const [comments, setComments] = useState<any[]>([]);
    const [post, setPost] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [replyingTo, setReplyingTo] = useState<any>(null);

    const loadPost = async () => {
        if (!id) return;
        setRefreshing(true);
        try {
            const postData = await getPostById(id as string, session ?? undefined);
            setPost(postData.data ?? postData);
            const commentsData = await getComments(id as string, 1, 50, session ?? undefined);
            setComments(commentsData.data ?? commentsData.comments ?? []);
        } catch (err) {
            console.error("Failed to load post details", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadPost();
    }, [id, session]);

    const handleLike = async () => {
        if (!post || !session) return;
        try {
            await toggleLikePost(post.id, !!post.liked, session);
            setPost((prev: any) => ({
                ...prev,
                liked: !prev.liked,
                totalLikes: (prev.totalLikes ?? 0) + (prev.liked ? -1 : 1),
            }));
        } catch (e) {
            console.error(e);
        }
    };

    const handleFlag = async () => {
        if (!post || !session) return;
        try {
            await toggleFlagPost(post.id, !!post.flagged, session);
            setPost((prev: any) => ({
                ...prev,
                flagged: !prev.flagged
            }));
        } catch (e) {
            console.error(e);
        }
    };

    const handleSendComment = async () => {
        if (!commentText.trim() || !user || !session) return;
        try {
            await addComment(id as string, commentText.trim(), session, replyingTo?.id); 
            await loadPost();
            setCommentText("");
            setReplyingTo(null);
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Failed to post comment.");
        }
    };

    return (
        <View style={styles.root}>
            <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
                <KeyboardAvoidingView
                    style={styles.keyboardView}
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                >
                    {/* Header */}
                    <View style={styles.topHeader}>
                        <Pressable 
                            onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} 
                            style={styles.backBtn}
                        >
                            <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
                            <Text style={styles.backLabel}>Back</Text>
                        </Pressable>
                    </View>

                    <ScrollView 
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent} 
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={loadPost}
                                tintColor={Colors.accentPrimary}
                            />
                        }
                    >
                        {loading && !post ? (
                            <View style={styles.loadingCenter}>
                                <ActivityIndicator color={Colors.accentPrimary} size="large" />
                            </View>
                        ) : post ? (
                            <>
                                <View style={styles.postSection}>
                                    <PostCard 
                                        post={post} 
                                        isDetailView 
                                        onLike={() => handleLike()}
                                        onFlag={() => handleFlag()}
                                    />
                                </View>

                                <View style={styles.commentsDivider}>
                                    <Text style={styles.commentsCount}>{comments.length} Comments</Text>
                                </View>

                                {comments.map((comment, index) => {
                                    const isReply = !!comment.parentId;
                                    return (
                                        <View key={comment.id} style={[styles.threadContainer, isReply && { marginLeft: 44 }]}>
                                            <View style={styles.threadLeft}>
                                                <Avatar username={comment.user?.username || comment.author?.username || 'user'} size={isReply ? "xs" : "sm"} />
                                                {index !== comments.length - 1 && !isReply && <View style={styles.threadLine} />}
                                            </View>
                                            
                                            <View style={styles.commentBodyWrapper}>
                                                <View style={styles.commentMetaRow}>
                                                    <View style={styles.authorRow}>
                                                        <Text style={styles.commentAuthor}>{comment.user?.username || comment.author?.username || 'user'}</Text>
                                                        {comment.parentId && <Text style={styles.replyingTag}>replied</Text>}
                                                    </View>
                                                    <Text style={styles.commentTime}>
                                                        {new Date(comment.createdAt).toLocaleDateString()}
                                                    </Text>
                                                </View>
                                                <Text style={styles.commentText}>{comment.content}</Text>
                                                <View style={styles.commentActions}>
                                                    <Pressable 
                                                        style={styles.commentAction}
                                                        onPress={() => setReplyingTo({ id: comment.id, username: comment.user?.username || comment.author?.username || 'user' })}
                                                    >
                                                        <Ionicons name="chatbubble-outline" size={14} color={Colors.textMuted} />
                                                        <Text style={styles.actionVal}>Reply</Text>
                                                    </Pressable>
                                                </View>
                                            </View>
                                        </View>
                                    );
                                })}
                                <View style={{ height: 40 }} />
                            </>
                        ) : (
                            <View style={styles.loadingCenter}>
                                <Text style={{ color: Colors.textMuted }}>Post not found</Text>
                            </View>
                        )}
                    </ScrollView>

                    {/* Sticky comment input area */}
                    <View style={[styles.inputWrapper, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                        <View style={styles.inputStack}>
                            {replyingTo && (
                                <View style={styles.replyingToBanner}>
                                    <Text style={styles.replyingToText}>Replying to @{replyingTo.username}</Text>
                                    <Pressable onPress={() => setReplyingTo(null)}>
                                        <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
                                    </Pressable>
                                </View>
                            )}
                            <View style={styles.inputRow}>
                                {user && <Avatar username={user.username} size="sm" />}
                                <View style={styles.inputFieldContainer}>
                                    <TextInput
                                        value={commentText}
                                        onChangeText={setCommentText}
                                        placeholder={replyingTo ? "Post your reply" : "Post your comment"}
                                        placeholderTextColor={Colors.textMuted}
                                        style={styles.textInput}
                                        multiline
                                    />
                                </View>
                                <Pressable 
                                    onPress={handleSendComment} 
                                    style={[
                                        styles.sendButton, 
                                        !commentText.trim() && { opacity: 0.5, backgroundColor: Colors.bgTertiary }
                                    ]}
                                    disabled={!commentText.trim()}
                                >
                                    <Ionicons name="send" size={18} color="#FFF" />
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: Colors.bgPrimary,
    },
    safeArea: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    topHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: Spacing.base,
        height: 56,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderSubtle,
        backgroundColor: Colors.bgPrimary,
    },
    backBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    backLabel: {
        fontFamily: Fonts.orbitron,
        color: Colors.textPrimary,
        fontSize: 18,
        fontWeight: '700',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    loadingCenter: {
        padding: 40,
        alignItems: 'center',
    },
    postSection: {
        borderBottomWidth: 8,
        borderBottomColor: Colors.bgSecondary,
    },
    commentsDivider: {
        padding: Spacing.base,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderSubtle,
    },
    commentsCount: {
        fontFamily: Fonts.oxaniumBold,
        color: Colors.textSecondary,
        fontSize: 16,
        fontWeight: '700',
    },
    threadContainer: {
        flexDirection: "row",
        paddingHorizontal: Spacing.base,
        paddingTop: Spacing.md,
    },
    threadLeft: {
        alignItems: "center",
        marginRight: Spacing.sm,
    },
    threadLine: {
        width: 2,
        flex: 1,
        backgroundColor: Colors.borderSubtle,
        marginTop: 8,
        marginBottom: -Spacing.md,
    },
    commentBodyWrapper: {
        flex: 1,
        paddingBottom: Spacing.md,
    },
    commentMetaRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 4,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    commentAuthor: {
        fontFamily: Fonts.oxaniumBold,
        color: Colors.textPrimary,
        fontWeight: '700',
    },
    replyingTag: {
        fontSize: 10,
        color: Colors.accentPrimary,
        backgroundColor: Colors.accentPrimary + '15',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    commentTime: {
        fontFamily: Fonts.oxanium,
        fontSize: 12,
        color: Colors.textMuted,
    },
    commentText: {
        fontFamily: Fonts.oxanium,
        color: Colors.textPrimary,
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 8,
    },
    commentActions: {
        flexDirection: "row",
        gap: 24,
    },
    commentAction: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    actionVal: {
        fontFamily: Fonts.oxanium,
        color: Colors.textMuted,
        fontSize: 13,
    },
    inputWrapper: {
        backgroundColor: Colors.bgPrimary,
        borderTopWidth: 1,
        borderTopColor: Colors.borderSubtle,
        paddingHorizontal: Spacing.base,
        paddingTop: Spacing.sm,
    },
    inputStack: {
        gap: 8,
    },
    replyingToBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.bgSecondary,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
    },
    replyingToText: {
        color: Colors.accentPrimary,
        fontSize: 13,
        fontFamily: Fonts.oxanium,
    },
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    inputFieldContainer: {
        flex: 1,
        backgroundColor: Colors.bgSecondary,
        borderRadius: 20,
        paddingHorizontal: 4,
    },
    textInput: {
        minHeight: 40,
        maxHeight: 120,
        color: Colors.textPrimary,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 15,
        fontFamily: Fonts.oxanium,
    },
    sendButton: {
        backgroundColor: Colors.accentPrimary,
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
