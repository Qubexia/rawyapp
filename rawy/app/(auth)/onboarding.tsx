import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    useWindowDimensions,
    Animated,
    TouchableOpacity,
    Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/utils/constants';

const slides = [
    {
        id: '1',
        title: 'Discover Podcasts That Inspire',
        description: 'Listen to the best audio content and episodes from your favorite creators. Rawy takes you on an enjoyable journey of knowledge and entertainment.',
        image: require('../../assets/images/onboarding1.png'),
    },
    {
        id: '2',
        title: 'Connect With Your Community',
        description: 'Engage with episodes through likes and comments. Follow your favorite creators and share your thoughts with the Rawy community.',
        image: require('../../assets/images/onboarding2.png'),
    },
    {
        id: '3',
        title: 'Become A Creator',
        description: 'Have something to share? Become a creator and start publishing your own episodes. Get instant notifications and build your audience.',
        image: require('../../assets/images/onboarding3.png'),
    },
    {
        id: '4',
        title: 'Pick Your Interests',
        description: 'Select your favorite topics below so we can recommend the best podcasts for you.',
        image: null,
    },
];

const TOPICS = [
    "Technology", "History", "Sports", "Business", "Health", 
    "Comedy", "True Crime", "Education", "Art", "News"
];

export default function OnboardingScreen() {
    const { width, height } = useWindowDimensions();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
    const scrollX = useRef(new Animated.Value(0)).current;
    const slidesRef = useRef<FlatList>(null);
    const router = useRouter();

    const viewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems && viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    const scrollTo = async () => {
        if (currentIndex < slides.length - 1) {
            slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            try {
                await AsyncStorage.setItem(STORAGE_KEYS.HAS_SEEN_ONBOARDING, 'true');
                if (selectedTopics.length > 0) {
                    // Ideally pass these to the backend during registration
                    await AsyncStorage.setItem('USER_INTERESTS', JSON.stringify(selectedTopics));
                }
            } catch (error) {
                // Ignore error saving state
            }
            // Navigate to the login screen
            router.replace('/(auth)/login' as any);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" backgroundColor="#FFFFFF" />
            <View style={{ flex: 3 }}>
                <FlatList
                    data={slides}
                    renderItem={({ item }) => {
                        if (item.id === '4') {
                            return (
                                <View style={[styles.slide, { width }]}>
                                    <View style={styles.textContainerTop}>
                                        <Text style={styles.title}>{item.title}</Text>
                                        <Text style={styles.description}>{item.description}</Text>
                                    </View>
                                    <View style={styles.topicsGrid}>
                                        {TOPICS.map((topic) => {
                                            const isSelected = selectedTopics.includes(topic);
                                            return (
                                                <TouchableOpacity
                                                    key={topic}
                                                    activeOpacity={0.7}
                                                    onPress={() => {
                                                        setSelectedTopics(prev => 
                                                            prev.includes(topic) 
                                                                ? prev.filter(t => t !== topic)
                                                                : [...prev, topic]
                                                        );
                                                    }}
                                                    style={[
                                                        styles.topicChip,
                                                        isSelected && styles.topicChipSelected
                                                    ]}
                                                >
                                                    <Text style={[
                                                        styles.topicText,
                                                        isSelected && styles.topicTextSelected
                                                    ]}>
                                                        {topic}
                                                    </Text>
                                                </TouchableOpacity>
                                            )
                                        })}
                                    </View>
                                </View>
                            );
                        }

                        return (
                            <View style={[styles.slide, { width }]}>
                                <View style={styles.imageContainer}>
                                    {item.image && (
                                        <Image
                                            source={item.image}
                                            style={[styles.image, { width: width * 0.9, height: height * 0.5 }]}
                                            resizeMode="contain"
                                        />
                                    )}
                                </View>
                                <View style={styles.textContainer}>
                                    <Text style={styles.title}>{item.title}</Text>
                                    <Text style={styles.description}>{item.description}</Text>
                                </View>
                            </View>
                        );
                    }}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled
                    bounces={false}
                    keyExtractor={(item, index) => item?.id ? String(item.id) : String(index)}
                    onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
                        useNativeDriver: false,
                    })}
                    scrollEventThrottle={32}
                    onViewableItemsChanged={viewableItemsChanged}
                    viewabilityConfig={viewConfig}
                    ref={slidesRef}
                    inverted={false} // Switch back since we are using English (LTR)
                />
            </View>

            <View style={styles.bottomContainer}>
                {/* Paginator */}
                <View style={styles.paginatorContainer}>
                    {slides.map((_, i) => {
                        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

                        const dotWidth = scrollX.interpolate({
                            inputRange,
                            outputRange: [10, 20, 10],
                            extrapolate: 'clamp',
                        });

                        const opacity = scrollX.interpolate({
                            inputRange,
                            outputRange: [0.3, 1, 0.3],
                            extrapolate: 'clamp',
                        });

                        return (
                            <Animated.View
                                style={[styles.dot, { width: dotWidth, opacity }]}
                                key={i.toString()}
                            />
                        );
                    })}
                </View>

                {/* Button */}
                <TouchableOpacity
                    style={styles.button}
                    activeOpacity={0.8}
                    onPress={scrollTo}
                >
                    <Text style={styles.buttonText}>
                        {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    slide: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageContainer: {
        flex: 0.6,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
    },
    image: {
        // Add border radius and shadow to give a premium look if it was a photo, 
        // but vector illustrations look better without border radius restriction.
    },
    textContainer: {
        flex: 0.4,
        paddingHorizontal: 30,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1F2937', // Dark Gray for high contrast
        marginBottom: 15,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: '#6B7280', // Cool Gray
        textAlign: 'center',
        lineHeight: 24,
    },
    bottomContainer: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 30,
        paddingBottom: 50,
    },
    paginatorContainer: {
        flexDirection: 'row', // Normal row for LTR
        height: 64,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        height: 10,
        borderRadius: 5,
        backgroundColor: '#000000', // Primary Modern Color
        marginHorizontal: 8,
    },
    button: {
        backgroundColor: '#000000',
        borderRadius: 30,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    textContainerTop: {
        marginTop: 60,
        paddingHorizontal: 30,
        alignItems: 'center',
    },
    topicsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingTop: 40,
        gap: 12,
    },
    topicChip: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 30,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    topicChipSelected: {
        backgroundColor: '#000000',
        borderColor: '#000000',
    },
    topicText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4B5563',
    },
    topicTextSelected: {
        color: '#FFFFFF',
    },
});
